import { io } from 'socket.io-client';


const URL = `${import.meta.env.VITE_BACKEND_URL}`; 

const socket = io(URL, {
  
   auth: {
  token: localStorage.getItem('token') 
   }
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