const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userProgramId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  },
  userDepartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  timestamp: {
    type: Date,
    required: true
  },
  action: {
    type: String,
    enum: ['login', 'logout'], 
    required: true
  },
})

module.exports = mongoose.model('Log', logSchema)


