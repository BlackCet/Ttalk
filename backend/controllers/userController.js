const User = require('../models/User');

// @desc    Get all users (excluding current user, for chat list)
// @route   GET /api/users
// @access  Private (requires JWT)
const getAllUsers = async (req, res) => {
  try {
    // req.user is populated by the 'protect' middleware
    // Find all users EXCEPT the current authenticated user
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
};