const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Repository = require('../models/Repository');
const PlagiarismReport = require('../models/PlagiarismReport');
const { protect } = require('../middleware/auth');
const { checkPlagiarism } = require('../utils/plagiarism');

const processUpload = multer({ storage: multer.memoryStorage() });

// @route   POST /api/v1/ml/plagiarism-check
// @desc    Check file for plagiarism against existing repositories
// @access  Private
router.post('/plagiarism-check', protect, processUpload.single('file'), async (req, res) => {
  try {
    const { repositoryId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file to check' });
    }

    // Extract text content from the uploaded file (assuming utf8 text/code)
    const newContent = req.file.buffer.toString('utf8');

    // Fetch existing file content from MongoDB (no disk access needed)
    const query = repositoryId ? { _id: { $ne: repositoryId } } : {};
    const otherRepos = await Repository.find(query).limit(50);
    
    let existingFiles = [];
    
    for (const repo of otherRepos) {
      for (const file of repo.files) {
        if (file.content) {
          existingFiles.push({
            id: file._id,
            repositoryId: repo._id,
            repositoryName: repo.name,
            fileName: file.originalName,
            content: file.content,
          });
        }
      }
    }

    // Run ML Plagiarism Detection asynchronously
    const result = await checkPlagiarism(newContent, existingFiles);

    let report = {
      fileName: req.file.originalname,
      score: result.score,
      label: result.label,
      matches: result.matches
    };

    // Save report only if it is associated with a specific repository
    if (repositoryId) {
      report = await PlagiarismReport.create({
        repositoryId,
        checkedBy: req.user._id,
        ...report
      });
    }

    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Plagiarism check error:', error);
    res.status(500).json({ success: false, message: 'Server error during plagiarism check' });
  }
});

// @route   GET /api/v1/ml/reports/:repositoryId
// @desc    Get plagiarism reports for a repository
// @access  Private
router.get('/reports/:repositoryId', protect, async (req, res) => {
  try {
    const reports = await PlagiarismReport.find({ repositoryId: req.params.repositoryId })
      .populate('checkedBy', 'username name')
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
