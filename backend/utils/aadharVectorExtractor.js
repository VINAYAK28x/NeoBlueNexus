const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

async function extractAadharVector(imagePath) {
    return new Promise((resolve, reject) => {
        // Get the absolute path to the Python script
        const pythonScript = path.resolve(__dirname, '../facial/extract_vector.py');
        
        // Get the Python executable path
        const pythonPath = 'python'; // Use 'python' command directly since it's in PATH

        console.log('Extracting face vector from:', imagePath);
        console.log('Using Python script:', pythonScript);

        // Execute the Python script
        exec(`"${pythonPath}" "${pythonScript}" "${imagePath}"`, (error, stdout, stderr) => {
            // Log stderr for debugging
            if (stderr) {
                console.log('Python (extract_vector) STDERR:', stderr);
            }

            // Log stdout for debugging, before attempting JSON parse
            if (stdout) {
                console.log('Python (extract_vector) STDOUT:', stdout);
            }

            if (error) {
                console.error('Python (extract_vector) error:', error);
                return reject(new Error(`Error processing image: ${error.message}`));
            }

            try {
                // Find the last line of stdout which should be our JSON result
                const lines = stdout.trim().split('\n');
                const jsonLine = lines[lines.length - 1];
                
                console.log('Attempting to parse JSON from:', jsonLine);
                const result = JSON.parse(jsonLine);
                
                if (result.error) {
                    console.error('Face extraction error (from Python result):', result.error);
                    return reject(new Error(result.error));
                }
                
                if (!result.vector || !Array.isArray(result.vector)) {
                    console.error('Invalid vector format (from Python result):', result);
                    return reject(new Error('Invalid face vector format'));
                }

                console.log('Successfully extracted face vector of length:', result.vector.length);
                resolve(result.vector);
            } catch (err) {
                console.error('Error parsing Python output in aadharVectorExtractor:', err);
                console.error('Raw stdout that caused parse error:', stdout);
                reject(new Error('Error parsing face vector output'));
            }
        });
    });
}

module.exports = extractAadharVector; 