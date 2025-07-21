const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const session = require('express-session'); 
const passport = require('passport');

const connectDB = require('./config/db');
const setupSocket = require('./config/socket');
const fileRoutes = require("./routes/fileRoutes");
const userRoutes = require('./routes/userRoutes');


dotenv.config();
connectDB();


const app = express();


require('./config/passport'); 


app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, 
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 1000 * 60 * 60 * 24 
    }
  })
);


app.use(passport.initialize());
app.use(passport.session()); 
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/auth'));        
app.use('/api/messages', require('./routes/messages')); 
app.use('/api', userRoutes);                            
app.use('/api/files', fileRoutes);                      


const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));