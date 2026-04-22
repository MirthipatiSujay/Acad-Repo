import sys
import json
import logging
from typing import List, Dict, Any

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Configure basic logging to stderr (so it doesn't corrupt stdout JSON)
logging.basicConfig(level=logging.ERROR, format='%(levelname)s: %(message)s')

class PlagiarismDetector:
    """
    A robust and optimized implementation of a Plagiarism Detection Engine.
    Uses scikit-learn for TF-IDF vectorization and Cosine Similarity calculation.
    """

    def __init__(self):
        # We use a standard English stop words filter and a token pattern that preserves 
        # both alpha-numeric terms, which is important for code-based string matching.
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            token_pattern=r'(?u)\b\w\w+\b',
            lowercase=True
        )

    def _get_label(self, score: int) -> str:
        """
        Determine the severity label based on the similarity score percentage.
        """
        if score < 30:
            return 'Original'
        elif score < 60:
            return 'Suspicious'
        else:
            return 'High Similarity'

    def process(self, new_content: str, existing_files: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates similarity scores between the newly uploaded content and all existing files.
        """
        if not existing_files:
            return {
                "score": 0,
                "label": "Original",
                "matches": []
            }

        # Combine all documents: [New Content] + [Existing File 1, Existing File 2, ...]
        all_documents = [new_content] + [f.get("content", "") for f in existing_files]

        try:
            # Build the TF-IDF matrix
            tfidf_matrix = self.vectorizer.fit_transform(all_documents)
        except ValueError as e:
            # Occurs if documents are entirely empty or contain no valid tokens
            logging.error(f"Vectorizer failed, possibly due to empty text: {e}")
            return {"score": 0, "label": "Original", "matches": []}

        # Calculate cosine similarity between the first document (new_content) and all others
        # cosine_similarity output shape is (1, N). Flatten it to [N]
        similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

        matches = []
        for i, similarity_value in enumerate(similarities):
            # Convert decimal ratio to percentage
            similarity_percent = int(round(similarity_value * 100))
            
            if similarity_percent > 10:
                file_info = existing_files[i]
                matches.append({
                    "repositoryId": file_info.get("repositoryId"),
                    "repositoryName": file_info.get("repositoryName"),
                    "fileName": file_info.get("fileName"),
                    "similarity": similarity_percent
                })

        # Sort matches descending by highest similarity
        matches.sort(key=lambda x: x["similarity"], reverse=True)

        # The overall score is the highest individual matching score
        top_score = matches[0]["similarity"] if matches else 0

        return {
            "score": top_score,
            "label": self._get_label(top_score),
            "matches": matches[:5]  # Return top 5 matches
        }


def main():
    """
    Acts as the entry point for the Node.js bridge.
    Reads JSON from standard input and prints the result to standard output.
    """
    try:
        # Read the raw input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            raise ValueError("No input data received.")

        parsed_data = json.loads(input_data)
        
        new_content = parsed_data.get("newContent", "")
        existing_files = parsed_data.get("existingFiles", [])

        # Initialize detector and process
        detector = PlagiarismDetector()
        result = detector.process(new_content, existing_files)

        # Output the exact JSON string required by Node.js
        # print() writes to stdout
        print(json.dumps(result))

    except Exception as e:
        # Pipe errors securely to stderr so stdout isn't corrupted
        logging.error(f"Python script execution failed: {e}")
        # Return a safe fallback to prevent server crashes
        fallback = {"score": 0, "label": "Error", "matches": []}
        print(json.dumps(fallback))
        sys.exit(1)


if __name__ == "__main__":
    main()
