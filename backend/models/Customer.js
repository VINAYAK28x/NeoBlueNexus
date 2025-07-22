const mongoose = require('mongoose');
const customerSchema = new mongoose.Schema({
name:{type: String, required:true},
dob: {type:Date, required:true},
aadharNumber:{type:String, required:true},
otherDocuments :{type:String},
facialVector:{type:[Number], required:true},
aadharVector: { type: [Number] },
doc2Vector: { type: [Number] },
aadharImagePath: { type: String },
doc2ImagePath: { type: String },
livelinessResult: {
    isLive: Boolean,
    aadharMatch: Boolean,
    doc2Match: Boolean,
    detectionDetails: {
        blink_detected: Boolean,
        mouth_movement: Boolean,
        skin_reflectance: Boolean
    }
},
livelinessTestCompleted: { type: Boolean, default: false },
livelinessTestDate: { type: Date }
});
module.exports = mongoose.model('Customer', customerSchema);