const { Server } = require('socket.io');
const Message = require('../models/Message'); 

function generateRoomId(user1, user2) {
  return [user1, user2].sort().join('_');
}

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL, 
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    
    socket.on('join_room', ({ senderId, receiverId }) => {
      const roomId = generateRoomId(senderId, receiverId);
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('send_message', async (data, callback) => {
      const { senderId, receiverId, message, type = 'text', fileUrl = '', tempId } = data; 
      const roomId = generateRoomId(senderId, receiverId);

      try {
        const newMessage = new Message({
          senderId,
          receiverId,
          message,
          type,
          fileUrl,
        });

        const savedMessage = await newMessage.save();
        console.log('Message saved to DB:', savedMessage._id);

       
        socket.to(roomId).emit('receive_message', savedMessage.toObject()); 

       
        io.to(socket.id).emit('message_confirmed', {
          tempId: tempId, 
          realMessage: savedMessage.toObject(), 
        });

        
        if (callback) callback({ success: true, realMessage: savedMessage.toObject() });

      } catch (err) {
        console.error('Error saving message:', err.message);
      
        io.to(socket.id).emit('message_send_failed', { tempId: tempId, error: err.message });
        if (callback) callback({ success: false, error: err.message, tempId: tempId });
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = setupSocket;