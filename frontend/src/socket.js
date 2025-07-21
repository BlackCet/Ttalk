import { io } from 'socket.io-client';

// The URL of your backend Socket.IO server
const URL = 'http://localhost:5000'; // Make sure this matches your backend's PORT

const socket = io(URL, {
  // If you need to send auth tokens with socket connection, configure here
  // auth: {
  //   token: localStorage.getItem('token') // Example
  // }
});

socket.on('connect', () => {
  console.log('Connected to Socket.IO server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from Socket.IO server');
});

socket.on('connect_error', (err) => {
  console.error('Socket.IO connection error:', err.message);
});


export default socket;