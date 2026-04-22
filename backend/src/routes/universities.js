const express = require('express');
const User = require('../models/User');
const Repository = require('../models/Repository');

const router = express.Router();

// @route   GET /api/v1/universities
// @desc    Get all unique university names (dynamically from user-entered data)
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Get distinct university names from both users and repositories
    const userUnis = await User.distinct('university', { university: { $ne: '' } });
    const repoUnis = await Repository.distinct('university', { university: { $ne: '' } });

    // Merge and deduplicate
    const allUnis = [...new Set([...userUnis, ...repoUnis])].filter(Boolean).sort();

    res.json({
      success: true,
      universities: allUnis,
      total: allUnis.length,
    });
  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
