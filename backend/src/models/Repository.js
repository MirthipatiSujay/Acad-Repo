const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number },
  mimetype: { type: String },
  content: { type: String, default: '' }, // Store text content for plagiarism checks
  uploadedAt: { type: Date, default: Date.now },
});

const repositorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Repository name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    university: {
      type: String,
      trim: true,
      default: '',
    },
    files: [fileSchema],
    tags: [{ type: String, trim: true }],
    language: { type: String, trim: true, default: 'Other' },
    isPublic: { type: Boolean, default: true },
    stars: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    readme: { type: String, default: '' },
  },
  { timestamps: true }
);

// Text index for search, override default language field since we use it for prog languages
repositorySchema.index(
  { name: 'text', description: 'text', tags: 'text' },
  { language_override: 'dummy_lang_override' }
);

module.exports = mongoose.model('Repository', repositorySchema);
