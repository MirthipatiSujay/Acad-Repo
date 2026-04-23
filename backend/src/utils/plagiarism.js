const natural = require('natural');

/**
 * Main plagiarism check function - Uses 'natural' package for TF-IDF and Cosine Similarity
 * @param {string} newContent - content of the file being checked
 * @param {Array<{id, repositoryId, repositoryName, fileName, content}>} existingFiles - files already in DB
 * @returns {Promise<{ score: number, label: string, matches: Array }>}
 */
async function checkPlagiarism(newContent, existingFiles) {
  try {
    if (!existingFiles || existingFiles.length === 0) {
      return { score: 0, label: 'Original', matches: [] };
    }

    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();

    // Check if newContent is effectively empty after tokenization basics
    const trimmedNewContent = newContent.trim();
    if (!trimmedNewContent || trimmedNewContent.length < 5) {
      return { score: 0, label: 'Original', matches: [] };
    }

    // Add new document
    tfidf.addDocument(newContent);

    // Add existing documents
    existingFiles.forEach(file => {
      tfidf.addDocument(file.content || '');
    });

    // Collect TF-IDF vectors
    const vectors = [];
    const numDocs = existingFiles.length + 1;

    for (let i = 0; i < numDocs; i++) {
      const terms = tfidf.listTerms(i);
      const vector = {};
      terms.forEach(t => { 
        vector[t.term] = t.tfidf; 
      });
      vectors.push(vector);
    }

    const newDocVector = vectors[0];
    const matches = [];

    // Calculate Cosine Similarity with every existing file
    for (let i = 0; i < existingFiles.length; i++) {
      const docVector = vectors[i + 1];
      
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;

      // Norm A and dot product
      for (const term in newDocVector) {
        normA += Math.pow(newDocVector[term], 2);
        if (docVector[term]) {
          dotProduct += newDocVector[term] * docVector[term];
        }
      }

      // Norm B
      for (const term in docVector) {
        normB += Math.pow(docVector[term], 2);
      }

      normA = Math.sqrt(normA);
      normB = Math.sqrt(normB);

      let similarity = 0;
      if (normA > 0 && normB > 0) {
        similarity = dotProduct / (normA * normB);
      }

      const similarityPercent = Math.round(similarity * 100);

      // Only include if slightly similar
      if (similarityPercent > 10) {
        matches.push({
          repositoryId: existingFiles[i].repositoryId,
          repositoryName: existingFiles[i].repositoryName,
          fileName: existingFiles[i].fileName,
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
    console.error("Plagiarism check error (natural logic):", err);
    return { score: 0, label: 'Error', matches: [] };
  }
}

module.exports = { checkPlagiarism };
