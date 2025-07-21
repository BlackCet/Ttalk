const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
   
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