const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const compareVectors = require('../utils/faceVerify');
const multer = require('multer');
const path = require('path');
const extractAadharVector = require('../utils/aadharVectorExtractor');

// Configure multer for Aadhar image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/aadhar');
    },
    filename: function (req, file, cb) {
        cb(null, `aadhar_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept only image files
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

router.get('/list', async(req,res)=>{
try{
const customers=await Customer.find();
res.status(200).json(customers);
}catch(err){
res.status(500).json({message:'Error fetching customers',error:err});
}
});
router.post('/add', async (req, res) => {
const { name, dob, aadharNumber, drivingLicense, otherDocuments, aadharVector, liveVector } = req.body;
// Facial verification removed from creation step
try {
const newCustomer = new Customer({
name,
dob,
aadharNumber,
drivingLicense,
otherDocuments,
facialVector: liveVector,
});
await newCustomer.save();
res.status(201).json({ message: 'Customer added successfully.', customer: newCustomer });
} catch (error) {
res.status(500).json({ message: 'Error saving customer', error });
}
});

// New route for Aadhar vector extraction and storage
router.post('/upload-aadhar', upload.single('aadharImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No Aadhar image uploaded' });
        }

        const { customerId } = req.body;
        if (!customerId) {
            return res.status(400).json({ message: 'Customer ID is required' });
        }

        // Extract vector from Aadhar image
        const aadharVector = await extractAadharVector(req.file.path);

        // Get current customer details
        const currentCustomer = await Customer.findById(customerId);
        if (!currentCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Find all customers with stored vectors
        const customers = await Customer.find({
            _id: { $ne: customerId }, // Exclude current customer
            aadharVector: { $exists: true, $ne: [] }
        });

        let bestMatch = null;
        let highestSimilarity = 0;

        // Compare with each customer's vectors
        for (const customer of customers) {
            if (customer.aadharVector && customer.aadharVector.length > 0) {
                const similarity = compareVectors(aadharVector, customer.aadharVector);
                if (similarity > highestSimilarity) {
                    highestSimilarity = similarity;
                    bestMatch = customer;
                }
            }
        }

        // If we found a match with high similarity (adjust threshold as needed)
        if (bestMatch && highestSimilarity > 0.6) {
            // If names are different, it's an identity mismatch
            if (bestMatch.name !== currentCustomer.name) {
                return res.status(409).json({
                    type: 'blacklist',
                    message: 'Identity mismatch detected - same face with different name',
                    existingCustomer: bestMatch,
                    similarity: highestSimilarity
                });
            }
            // If names match, it's a duplicate
            return res.status(409).json({
                type: 'duplicate',
                message: 'Customer already exists in the system',
                existingCustomer: bestMatch,
                similarity: highestSimilarity
            });
        }

        // Update customer record with Aadhar vector and image path
        const updatedCustomer = await Customer.findByIdAndUpdate(
            customerId,
            { 
                aadharVector: aadharVector,
                aadharImagePath: req.file.path
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Aadhar vector and image stored successfully',
            customer: updatedCustomer
        });

    } catch (error) {
        console.error('Error processing Aadhar image:', error);
        res.status(500).json({ 
            message: 'Error processing Aadhar image',
            error: error.message 
        });
    }
});

// New route for Doc2 vector extraction, storage, and comparison
router.post('/upload-doc2', upload.single('doc2Image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No Doc2 image uploaded' });
        }

        const { customerId } = req.body;
        if (!customerId) {
            return res.status(400).json({ message: 'Customer ID is required' });
        }

        // Extract vector from Doc2 image
        console.log('Attempting to extract Doc2 vector from:', req.file.path); // Log path
        const doc2Vector = await extractAadharVector(req.file.path);
        console.log('Extracted doc2Vector:', doc2Vector); // Log extracted vector

        // Check if doc2Vector is empty or invalid
        if (!doc2Vector || doc2Vector.length === 0) {
            return res.status(400).json({ message: 'Failed to extract facial vector from Doc2 image.' });
        }

        // Update customer record with Doc2 (facial) vector and image path
        const updatedCustomer = await Customer.findByIdAndUpdate(
            customerId,
            { 
                facialVector: doc2Vector,
                doc2ImagePath: req.file.path // Save the file path
            },
            { new: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Compare with Aadhar vector
        const aadharVector = updatedCustomer.aadharVector;
        let match = false;
        if (aadharVector && Array.isArray(aadharVector) && aadharVector.length === doc2Vector.length) {
            match = compareVectors(aadharVector, doc2Vector);
        }

        res.status(200).json({ 
            message: 'Doc2 vector and image stored successfully',
            match,
            customer: updatedCustomer
        });

    } catch (error) {
        console.error('Error processing Doc2 image:', error);
        res.status(500).json({ 
            message: 'Error processing Doc2 image',
            error: error.message 
        });
    }
});

router.post('/update-liveliness', async (req, res) => {
    try {
        const { customerId, livelinessResult } = req.body;

        if (!customerId || !livelinessResult) {
            return res.status(400).json({ message: 'Customer ID and liveliness results are required' });
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(
            customerId,
            { 
                livelinessResult: livelinessResult,
                livelinessTestCompleted: true,
                livelinessTestDate: new Date()
            },
            { new: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Liveliness test results saved successfully',
            customer: updatedCustomer
        });
    } catch (error) {
        console.error('Error saving liveliness results:', error);
        res.status(500).json({ 
            message: 'Error saving liveliness results',
            error: error.message 
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(customer);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching customer', error: err });
    }
});

// Add this new route for existing customer verification
router.post('/verify-existing', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        // Extract vector from the uploaded image
        const liveVector = await extractAadharVector(req.file.path);
        if (!liveVector || liveVector.length === 0) {
            return res.status(400).json({ message: 'Failed to extract facial vector from image' });
        }

        // Find all customers with stored vectors
        const customers = await Customer.find({
            $or: [
                { aadharVector: { $exists: true, $ne: [] } },
                { doc2Vector: { $exists: true, $ne: [] } }
            ]
        });

        let bestMatch = null;
        let highestSimilarity = 0;
        let matchType = null;

        // Compare with each customer's vectors
        for (const customer of customers) {
            // Compare with Aadhar vector
            if (customer.aadharVector && customer.aadharVector.length > 0) {
                const similarity = compareVectors(liveVector, customer.aadharVector);
                console.log(`Aadhar similarity for ${customer.name}: ${similarity}`);
                if (similarity > highestSimilarity) {
                    highestSimilarity = similarity;
                    bestMatch = customer;
                    matchType = 'aadhar';
                }
            }

            // Compare with Doc2 vector
            if (customer.doc2Vector && customer.doc2Vector.length > 0) {
                const similarity = compareVectors(liveVector, customer.doc2Vector);
                console.log(`Doc2 similarity for ${customer.name}: ${similarity}`);
                if (similarity > highestSimilarity) {
                    highestSimilarity = similarity;
                    bestMatch = customer;
                    matchType = 'doc2';
                }
            }
        }

        console.log(`Best match: ${bestMatch?.name}, Similarity: ${highestSimilarity}, Type: ${matchType}`);

        // If we found a match with high similarity
        if (bestMatch && highestSimilarity > 0.6) { // Adjust threshold as needed
            return res.status(200).json({
                match: true,
                customer: {
                    name: bestMatch.name,
                    aadharNumber: bestMatch.aadharNumber,
                    dob: bestMatch.dob,
                    id: bestMatch._id,
                    matchType: matchType,
                    similarity: highestSimilarity
                }
            });
        }

        return res.status(200).json({
            match: false,
            message: 'No matching customer found'
        });

    } catch (error) {
        console.error('Error in verify-existing:', error);
        res.status(500).json({ 
            message: 'Error processing verification',
            error: error.message 
        });
    }
});

// Add new route for blacklisting user
router.post('/blacklist-user', async (req, res) => {
    try {
        const { customerId } = req.body;
        
        if (!customerId) {
            return res.status(400).json({ message: 'Customer ID is required' });
        }

        // Delete the customer record
        await Customer.findByIdAndDelete(customerId);

        res.status(200).json({
            success: true,
            message: 'User has been blacklisted and removed from the system'
        });

    } catch (error) {
        console.error('Error blacklisting user:', error);
        res.status(500).json({ 
            message: 'Error blacklisting user',
            error: error.message 
        });
    }
});

module.exports = router;