const express = require('express');
const router = express.Router();
const { signup, login, logoutUser } = require('../controllers/authController'); // Import from authController.js
const passport = require('passport');
const jwt = require('jsonwebtoken');

// --- Standard Authentication Routes ---
router.post('/logout', logoutUser);
router.post('/signup', signup);
router.post('/login', login);

// --- Google OAuth Routes ---

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}?error=oauth_failed`,
    session: false,
  }),
  (req, res) => {
    if (!req.user) {
      console.error('Google callback: req.user is undefined after successful authentication.');
      return res.redirect(`${process.env.CLIENT_URL}?error=authentication_issue`);
    }

    console.log('Google authentication successful for user:', req.user.email || req.user.name);

    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  }
);

module.exports = router;