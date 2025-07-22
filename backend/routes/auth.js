const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
router.post('/register', async (req, res) => {
try {
const { employeeName, joiningDate, adminId, branchCode, password } = req.body;
const existingUser = await User.findOne({ adminId });
if (existingUser) return res.status(400).json({ message: 'Admin ID already exists' });
const hashedPassword = await bcrypt.hash(password, 10);
const newUser = new User({ employeeName, joiningDate, adminId, branchCode, password: hashedPassword });
await newUser.save();
res.status(201).json({ message: 'User registered' });
} catch (err) {
res.status(500).json({ error: err.message });
}
});
router.post('/login', async (req, res) => {
try {
const { adminId, password } = req.body;
const user = await User.findOne({ adminId });
if (!user) return res.status(400).json({ message: 'Invalid credentials' });
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
res.json({ token, user: { id: user._id, employeeName: user.employeeName } });
} catch (err) {
res.status(500).json({ error: err.message });
}
});
module.exports = router;