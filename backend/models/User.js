const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    sparse: true,
    required: false,
    default: undefined // Ensures field is omitted if not provided
  },
  mobile: {
    type: String,
    unique: true,
    sparse: true,
    required: false,
    default: undefined // Ensures field is omitted if not provided
  },
  password: {
    type: String,
    required: false,
    default: undefined // Ensures field is omitted if not provided
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    required: false,
    default: undefined // Ensures field is omitted if not provided
  },
});

module.exports = mongoose.model('User', userSchema);