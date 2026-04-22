const { spawn } = require('child_process');
const path = require('path');

/**
 * Main plagiarism check function - Async Wrapper for Python Script
 * @param {string} newContent - content of the file being checked
 * @param {Array<{id, repositoryId, repositoryName, fileName, content}>} existingFiles - files already in DB
 * @returns {Promise<{ score: number, label: string, matches: Array }>}
 */
function checkPlagiarism(newContent, existingFiles) {
  return new Promise((resolve, reject) => {
    try {
      const pythonScriptPath = path.join(__dirname, 'plagiarism_detector.py');
      
      // Spawn Python process
      const pythonProcess = spawn('python', [pythonScriptPath]);

      let outputData = '';
      let errorData = '';

      // Collect data from standard output
      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      // Collect data from standard error (for logging)
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      // Handle process completion
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python script exited with code ${code}. Error: ${errorData}`);
          // Return a safe fallback so the route doesn't crash completely
          return resolve({ score: 0, label: 'Error', matches: [] });
        }

        try {
          // Parse the JSON string outputted by the Python script
          const result = JSON.parse(outputData);
          resolve(result);
        } catch (parseError) {
          console.error("Failed to parse Python script output:", parseError);
          console.error("Raw output was:", outputData);
          resolve({ score: 0, label: 'Error (Parse)', matches: [] });
        }
      });

      // Feed input data to Python script's stdin safely
      const inputJSON = JSON.stringify({
        newContent: newContent,
        existingFiles: existingFiles
      });

      pythonProcess.stdin.write(inputJSON);
      pythonProcess.stdin.end();

    } catch (err) {
      console.error("Failed to spawn python child process:", err);
      reject(err);
    }
  });
}

module.exports = { checkPlagiarism };
