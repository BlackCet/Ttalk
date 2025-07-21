const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    sparse: true,
    required: false,
    default: undefined 
  },
  mobile: {
    type: String,
    unique: true,
    sparse: true,
    required: false,
    default: undefined 
  },
  password: {
    type: String,
    required: false,
    default: undefined 
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    required: false,
    default: undefined 
  },
});

module.exports = mongoose.model('User', userSchema);