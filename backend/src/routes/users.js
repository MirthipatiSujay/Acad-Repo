const express = require('express');
const User = require('../models/User');
const Repository = require('../models/Repository');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/v1/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const repositories = await Repository.find({ owner: user._id, isPublic: true })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, user, repositories });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/v1/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, skills, university } = req.body;

    const trimmedUni = university ? university.trim() : '';
    
    // Get existing user to check if university is changing
    const currentUser = await User.findById(req.user._id);
    const universityChanged = currentUser && currentUser.university !== trimmedUni;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, skills, university: trimmedUni },
      { new: true, runValidators: true }
    )
      .select('-password');

    // If university changed, sync it with all user's repositories
    if (universityChanged) {
      await Repository.updateMany(
        { owner: req.user._id },
        { university: trimmedUni }
      );
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/v1/users
// @desc    Get all users (for leaderboard / explore)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const users = await User.find()
      .select('-password')
      .sort({ repositoryCount: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments();
    res.json({ success: true, users, total, page: Number(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/v1/users/account
// @desc    Delete the currently logged-in user's account and all associated data
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Gather all repositories owned by this user
    const userRepos = await Repository.find({ owner: userId });

    // 2. Delete physical files from disk for each repository
    const fs = require('fs');
    const path = require('path');
    for (const repo of userRepos) {
      if (repo.files && repo.files.length > 0) {
        for (const file of repo.files) {
          try {
            const filePath = path.resolve(file.path);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (fileErr) {
            // Continue cleanup even if a single file fails
          }
        }
      }
    }

    // 3. Remove all plagiarism reports linked to user's repositories
    const repoIds = userRepos.map(r => r._id);
    const PlagiarismReport = require('../models/PlagiarismReport');
    await PlagiarismReport.deleteMany({
      $or: [
        { repositoryId: { $in: repoIds } },
        { checkedBy: userId }
      ]
    });

    // 4. Delete all repositories
    await Repository.deleteMany({ owner: userId });

    // 5. Delete the user document
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Your account and all associated data have been permanently deleted.' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Server error during account deletion' });
  }
});

module.exports = router;
