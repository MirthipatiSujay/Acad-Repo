const natural = require('natural');

/**
 * Main plagiarism check function - Uses 'natural' package for Dice Coefficient
 * @param {string} newContent - content of the file being checked
 * @param {Array<{id, repositoryId, repositoryName, fileName, content}>} existingFiles - files already in DB
 * @returns {Promise<{ score: number, label: string, matches: Array }>}
 */
async function checkPlagiarism(newContent, existingFiles) {
  try {
    if (!existingFiles || existingFiles.length === 0) {
      return { score: 0, label: 'Original', matches: [] };
    }

    const trimmedNewContent = newContent.trim();
    if (!trimmedNewContent || trimmedNewContent.length < 10) {
      return { score: 0, label: 'Original', matches: [] };
    }

    // Completely remove all whitespace and format to lowercase
    // This catches code/essay plagiarism with 100% accuracy even if they added extra spaces or line breaks
    const normalizedNewContent = trimmedNewContent.replace(/\s+/g, '').toLowerCase();

    const matches = [];

    // Calculate Sørensen–Dice coefficient similarity with every existing file
    // DiceCoefficient evaluates the similarity of two strings based on bigrams
    // Excellent for catching copy-pasting of code or essays. Returns 0.0 to 1.0.
    for (const file of existingFiles) {
      if (!file.content) continue;

      const normalizedExisting = file.content.replace(/\s+/g, '').toLowerCase();
      const similarity = natural.DiceCoefficient(normalizedNewContent, normalizedExisting);
      const similarityPercent = Math.round(similarity * 100);

      if (similarityPercent > 10) {
        matches.push({
          repositoryId: file.repositoryId,
          repositoryName: file.repositoryName,
          fileName: file.fileName,
          similarity: similarityPercent
        });
      }
    }

    // Sort by highest similarity
    matches.sort((a, b) => b.similarity - a.similarity);

    const topScore = matches.length > 0 ? matches[0].similarity : 0;
    
    let label = 'Original';
    if (topScore >= 60) label = 'High Similarity';
    else if (topScore >= 30) label = 'Suspicious';

    return {
      score: topScore,
      label: label,
      matches: matches.slice(0, 5) // top 5 matches
    };

  } catch (err) {
    console.error("Plagiarism check error:", err);
    return { score: 0, label: 'Error', matches: [] };
  }
}

module.exports = { checkPlagiarism };
