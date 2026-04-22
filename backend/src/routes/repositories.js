const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Repository = require('../models/Repository');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Optional: filter file types here. Currently allowing all for simplicity, 
    // but in a real app you'd restrict to known code/doc formats.
    cb(null, true);
  },
});

// @route   POST /api/v1/repositories
// @desc    Create a new repository with optional files
// @access  Private
router.post('/', protect, upload.array('files', 10), async (req, res) => {
  try {
    const { name, description, tags, language, isPublic, readme } = req.body;

    // Check if repository with same name exists for this user
    const existingRepo = await Repository.findOne({ owner: req.user._id, name });
    if (existingRepo) {
      // Clean up uploaded files since we're rejecting
      if (req.files) req.files.forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
      return res.status(400).json({ success: false, message: 'Repository with this name already exists' });
    }

    // --- Plagiarism Threshold Check ---
    const PLAGIARISM_THRESHOLD = Number(process.env.PLAGIARISM_THRESHOLD) || 60;

    if (req.files && req.files.length > 0) {
      const { checkPlagiarism } = require('../utils/plagiarism');

      // Fetch existing files from all other repositories for comparison
      const otherRepos = await Repository.find().limit(50);
      let existingFiles = [];
      for (const repo of otherRepos) {
        for (const file of repo.files) {
          try {
            const filePath = path.resolve(file.path);
            if (fs.existsSync(filePath)) {
              existingFiles.push({
                id: file._id,
                repositoryId: repo._id,
                repositoryName: repo.name,
                fileName: file.originalName,
                content: fs.readFileSync(filePath, 'utf8'),
              });
            }
          } catch (err) { /* skip unreadable files */ }
        }
      }

      // Check each uploaded file against existing files
      if (existingFiles.length > 0) {
        for (const uploadedFile of req.files) {
          try {
            const content = fs.readFileSync(uploadedFile.path, 'utf8');
            const result = await checkPlagiarism(content, existingFiles);

            if (result.score >= PLAGIARISM_THRESHOLD) {
              // Clean up ALL uploaded temp files before rejecting
              req.files.forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));

              return res.status(403).json({
                success: false,
                message: `Upload rejected: "${uploadedFile.originalname}" has ${result.score}% similarity with existing projects (threshold: ${PLAGIARISM_THRESHOLD}%).`,
                plagiarismReport: {
                  fileName: uploadedFile.originalname,
                  score: result.score,
                  label: result.label,
                  threshold: PLAGIARISM_THRESHOLD,
                  matches: result.matches,
                },
              });
            }
          } catch (readErr) {
            // If file can't be read as text (e.g. binary), skip plagiarism check for it
          }
        }
      }
    }
    // --- End Plagiarism Check ---

    const files = req.files ? req.files.map((file) => ({
      originalName: file.originalname,
      storedName: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
    })) : [];

    const repository = await Repository.create({
      name,
      description,
      owner: req.user._id,
      university: req.user.university,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      language,
      isPublic: isPublic !== undefined ? isPublic : true,
      readme: readme || '',
      files,
    });

    // Increment user's repository count
    await User.findByIdAndUpdate(req.user._id, { $inc: { repositoryCount: 1 } });

    res.status(201).json({ success: true, repository });
  } catch (error) {
    console.error('Create repo error:', error);
    // Clean up uploaded files on error
    if (req.files) req.files.forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/v1/repositories
// @desc    Get all public repositories (with pagination & filtering)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, university, tags, language, limit = 20, page = 1 } = req.query;

    const filter = { isPublic: true };

    if (search) {
      filter.$text = { $search: search }; // Requires text index
    }
    if (university) {
      filter.university = { $regex: new RegExp(`^${university}$`, 'i') };
    }
    if (language) filter.language = language;
    if (tags) {
      filter.tags = { $in: Array.isArray(tags) ? tags : tags.split(',') };
    }

    const repositories = await Repository.find(filter)
      .populate('owner', 'username name avatar')
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Repository.countDocuments(filter);

    res.json({ success: true, repositories, total, page: Number(page) });
  } catch (error) {
    console.error('Get repos error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/v1/repositories/:id
// @desc    Get repository by ID
// @access  Public (if public) or Private (if owner)
router.get('/:id', async (req, res) => {
  try {
    const repository = await Repository.findById(req.params.id)
      .populate('owner', 'username name avatar');

    if (!repository) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    // Check visibility
    if (!repository.isPublic) {
      // Need user to be logged in and the owner
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to view this repository' });
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (repository.owner._id.toString() !== decoded.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this repository' });
        }
      } catch (err) {
         return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
      }
    }

    // Increment views
    repository.views += 1;
    await repository.save({ validateBeforeSave: false });

    res.json({ success: true, repository });
  } catch (error) {
    console.error('Get repo error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/v1/repositories/:id/files/:fileId
// @desc    Download/view a file
// @access  Public (if public) or Private (if owner)
router.get('/:id/files/:fileId', async (req, res) => {
    try {
        const repository = await Repository.findById(req.params.id);
        
        if (!repository) {
            return res.status(404).json({ success: false, message: 'Repository not found' });
        }

        // Visibility check... (simplified for now, assuming public for demonstration)

        const file = repository.files.id(req.params.fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found in repository' });
        }

        const filePath = path.resolve(file.path);
        if (!fs.existsSync(filePath)) {
             return res.status(404).json({ success: false, message: 'File not found on server' });
        }

        res.download(filePath, file.originalName);
    } catch(error) {
        console.error('File download error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/v1/repositories/:id/star
// @desc    Star a repository
// @access  Public (simplified for MVP)
router.post('/:id/star', async (req, res) => {
  try {
    const repository = await Repository.findById(req.params.id);
    if (!repository) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }
    repository.stars += 1;
    await repository.save({ validateBeforeSave: false });
    
    res.json({ success: true, stars: repository.stars });
  } catch (error) {
    console.error('Star error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/v1/repositories/:id
// @desc    Delete a repository and its files
// @access  Private (Owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const repository = await Repository.findById(req.params.id);

    if (!repository) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    // Checking if user is owner of the repo
    if (repository.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this repository' });
    }

    // Delete associated physical files
    if (repository.files && repository.files.length > 0) {
      for (const file of repository.files) {
        const filePath = path.resolve(file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // Decrement users repo count
    await User.findByIdAndUpdate(req.user._id, { $inc: { repositoryCount: -1 } });

    // Actually delete the repo from Mongo
    await repository.deleteOne();

    res.json({ success: true, message: 'Repository deleted successfully' });
  } catch (error) {
    console.error('Delete repository error:', error);
    res.status(500).json({ success: false, message: 'Server error on deletion' });
  }
});

module.exports = router;
