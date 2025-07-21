const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Adjust path as needed

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google Profile received:', profile.id, profile.displayName, profile.emails?.[0]?.value);

        const googleEmail = profile.emails?.[0]?.value;

        // 1. Try to find a user by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('User found by googleId:', user.email || user.name);
          if (googleEmail && user.email !== googleEmail) {
            user.email = googleEmail;
            await user.save();
            console.log('Updated user email for consistency:', user.email);
          }
          return done(null, user);
        }

        // 2. If no user found by googleId, check if an existing user has this Google email
        if (googleEmail) {
          user = await User.findOne({ email: googleEmail });
          if (user) {
            console.log('User found by email, linking Google ID:', user.email);
            user.googleId = profile.id;
            if (!user.name) user.name = profile.displayName;
            await user.save();
            return done(null, user);
          }
        }

        // 3. If no existing user found, create a new user
        console.log('Creating new user from Google profile...');
        const newUser = new User({
          name: profile.displayName,
          email: googleEmail || undefined,
          googleId: profile.id,
        });
        await newUser.save();
        console.log('New Google user created:', newUser.email || newUser.name);
        done(null, newUser);
      } catch (err) {
        console.error('Error in Google Strategy callback:', err);
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error('Error in deserializeUser:', err);
    done(err, null);
  }
});