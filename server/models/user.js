const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true, 
    required: true 
  },
  password: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department'},
  verificationCode: { type: String },
  verified: { type: Boolean, default: false },
  notes: { type: String },
  bookshelf: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LearningMaterial' }],
})

module.exports = mongoose.model('User', UserSchema)