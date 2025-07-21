const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const session = require('express-session'); // Keep if other parts of app use sessions
const passport = require('passport');

const connectDB = require('./config/db');
const setupSocket = require('./config/socket');
const fileRoutes = require("./routes/fileRoutes");
const userRoutes = require('./routes/userRoutes');

// Load env vars
dotenv.config();
connectDB();

// Initialize express app
const app = express();

// Passport config
require('./config/passport'); // This initializes the GoogleStrategy

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // Important for cookies/sessions if you were using them for auth
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session (Keep this if you need sessions for non-auth purposes, or for other auth types)
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Make sure this is filled in .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

// Passport middleware (Keep this even with session: false for Google, as it initializes Passport)
app.use(passport.initialize());
app.use(passport.session()); // This is technically not used for Google OAuth if session: false is set, but required if other strategies rely on sessions

// Static files for uploaded content
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));        // for login/signup/google
app.use('/api/messages', require('./routes/messages')); // chat messages
app.use('/api', userRoutes);                            // user CRUD
app.use('/api/files', fileRoutes);                      // media sharing

// Create server with Socket.IO
const server = http.createServer(app);
setupSocket(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));