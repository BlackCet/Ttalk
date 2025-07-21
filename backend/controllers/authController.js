const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const signup = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  if (!name || !password || (!email && !mobile)) {
    return res.status(400).json({ msg: 'Please enter name, password, and either email or mobile.' });
  }

  try {
    
    let existingUserByEmail, existingUserByMobile;
    if (email) {
      existingUserByEmail = await User.findOne({ email });
    }
    if (mobile) {
      existingUserByMobile = await User.findOne({ mobile });
    }

    if (existingUserByEmail || existingUserByMobile) {
      return res.status(400).json({ msg: 'A user with that email or mobile already exists.' });
    }

    
     const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email || undefined,
      mobile: mobile || undefined,
      password: password, 
    });

    if (newUser) {
      res.status(201).json({
        msg: 'User registered successfully',
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          mobile: newUser.mobile,
        },
        token: generateToken(newUser._id),
      });
    } else {
      res.status(400).json({ msg: 'Invalid user data provided.' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    
    res.status(500).json({ msg: 'Server error during signup.' });
  }
};


const login = async (req, res) => {
  const { emailOrMobile, password } = req.body;

  if (!emailOrMobile || !password) {
    return res.status(400).json({ msg: 'Please enter email/mobile and password.' });
  }

  try {
    const user = await User.findOne({ $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }] });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials.' });
    }

   
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials.' });
    }

    res.json({
      msg: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: 'Server error during login.' });
  }
};


const logoutUser = (req, res) => {
  res.status(200).json({ msg: 'Logged out successfully (client-side token removal expected).' });
};

module.exports = { signup, login, logoutUser };