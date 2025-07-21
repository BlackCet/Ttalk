const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController'); // Import getAllUsers
const User = require('../models/User'); // Import User model
const protect = require('../middleware/authMiddleware'); // Import the protect middleware

// @route   GET /api/users
// @desc    Get all users (excluding current user, for chat list)
// @access  Private (requires JWT)
router.get('/', protect, getAllUsers); // This route now uses protect middleware

// @route   GET /api/me
// @desc    Get current authenticated user's profile
// @access  Private (requires JWT)
router.get('/me', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ msg: 'User not found in request context' });
    }
    res.json({ user: req.user });
  } catch (error) {
    console.error('Error fetching current user profile:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile (e.g., add mobile number)
// @access  Private (requires JWT)
router.put('/profile', protect, async (req, res) => {
  const { name, email, mobile, password } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (name !== undefined) user.name = name;

      if (email !== undefined) {
        if (email !== user.email) {
          const existingEmailUser = await User.findOne({ email });
          if (existingEmailUser && existingEmailUser._id.toString() !== user._id.toString()) {
            return res.status(400).json({ msg: 'Email already in use by another account.' });
          }
        }
        user.email = email;
      }

      if (mobile !== undefined) {
        if (mobile !== user.mobile) {
            const existingMobileUser = await User.findOne({ mobile });
            if (existingMobileUser && existingMobileUser._id.toString() !== user._id.toString()) {
              return res.status(400).json({ msg: 'Mobile number already in use by another account.' });
            }
        }
        user.mobile = mobile;
      }

      if (password !== undefined && password !== '') {
        // WARNING: Replace with actual password hashing in a real application!
        // const bcrypt = require('bcryptjs');
        // const salt = await bcrypt.genSalt(10);
        // user.password = await bcrypt.hash(password, salt);
        user.password = password;
      }

      const updatedUser = await user.save();

      res.json({
        msg: 'Profile updated successfully',
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          googleId: updatedUser.googleId,
        }
      });
    } else {
      res.status(404).json({ msg: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ msg: 'Duplicate key error: The provided email or mobile is already in use.' });
    }
    res.status(500).json({ msg: 'Server error during profile update.' });
  }
});

module.exports = router;