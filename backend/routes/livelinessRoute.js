const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const Customer = require('../models/Customer'); // Import Customer model
const compareVectors = require('../utils/faceVerify'); // Import face comparison utility
const fs = require('fs');

// Configure multer for Liveliness video upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure the directory exists
        const uploadDir = 'uploads/liveness';
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `liveness_${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage: storage });

// Path to the Python script
const pythonScriptPath = path.resolve(__dirname, '../facial/main.py');
const pythonExecutable = process.env.PYTHON_PATH || 'python';

router.post('/liveliness-test', upload.single('video'), async (req, res) => {
    const { customerId } = req.body;

    if (!customerId) {
        return res.status(400).json({ success: false, message: 'Customer ID is required' });
    }

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No video uploaded' });
    }

    const videoPath = path.resolve(req.file.path);
    console.log('Received video at:', videoPath);

    try {
        // We no longer pass the python script path with each exec call, it's defined globally
        exec(`"${pythonExecutable}" "${pythonScriptPath}" "${videoPath}"`,
            async (error, stdout, stderr) => {
                // Log any stderr output (debug messages)
                if (stderr) {
                    console.log('Python debug output:', stderr);
                }

                if (error) {
                    console.error('Python error:', error);
                    return res.status(500).json({ success: false, message: 'Processing failed', detail: error.message });
                }

                // Find the last line of stdout which should be our JSON result
                const lines = stdout.trim().split('\n');
                const jsonLine = lines[lines.length - 1];
                
                let pythonResult;
                try {
                    pythonResult = JSON.parse(jsonLine);
                    console.log('Parsed Python Result:', pythonResult);
                } catch (parseError) {
                    console.error('Error parsing Python output:', parseError);
                    console.error('Raw output:', stdout);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error parsing Python script output', 
                        detail: parseError.message 
                    });
                }

                const { is_live, live_face_vector, detection_details, error: pythonError } = pythonResult;
                console.log('is_live value:', is_live);

                if (pythonError) {
                    return res.status(500).json({ success: false, message: 'Liveness test failed', detail: pythonError });
                }

                if (!is_live) {
                    return res.json({
                        success: false,
                        isLive: false,
                        message: 'Liveness test failed: No liveness detected',
                        detectionDetails: detection_details
                    });
                }

                if (!live_face_vector || live_face_vector.length === 0) {
                    return res.json({
                        success: false,
                        isLive: true,
                        message: 'Liveness detected, but no face vector extracted',
                        detectionDetails: detection_details
                    });
                }

                // Fetch customer details to get aadharVector and doc2Vector
                const customer = await Customer.findById(customerId);

                if (!customer) {
                    return res.status(404).json({ success: false, message: 'Customer not found' });
                }

                const aadharVector = customer.aadharVector;
                const doc2Vector = customer.facialVector;

                let aadharMatch = false;
                let doc2Match = false;

                if (aadharVector) {
                    aadharMatch = compareVectors(live_face_vector, aadharVector);
                }

                if (doc2Vector) {
                    doc2Match = compareVectors(live_face_vector, doc2Vector);
                }

                const overallSuccess = is_live && aadharMatch && doc2Match;

                res.json({
                    success: overallSuccess,
                    isLive: is_live,
                    aadharMatch: aadharMatch,
                    doc2Match: doc2Match,
                    message: overallSuccess ? 'Liveness and face verification successful!' : 'Liveness or face verification failed.',
                    detectionDetails: detection_details
                });
            });

    } catch (err) {
        console.error('Error in liveliness-test route:', err);
        res.status(500).json({ success: false, message: 'Server error during liveliness test', error: err.message });
    }
});

module.exports = router;