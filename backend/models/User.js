const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
employeeName: String,
joiningDate: Date,
adminId: { type: String, unique: true },
branchCode: String,
password: String,
});
module.exports = mongoose.model('User', userSchema);