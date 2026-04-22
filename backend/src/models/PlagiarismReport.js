const mongoose = require('mongoose');

const plagiarismReportSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
    },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: { type: String, required: true },
    fileContent: { type: String },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    label: {
      type: String,
      enum: ['Original', 'Suspicious', 'High Similarity'],
      required: true,
    },
    matches: [
      {
        repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' },
        repositoryName: String,
        fileName: String,
        similarity: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlagiarismReport', plagiarismReportSchema);
