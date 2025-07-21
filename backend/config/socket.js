const { Server } = require('socket.io');
const Message = require('../models/Message'); // Ensure path is correct

// Generate consistent room ID for any two users
function generateRoomId(user1, user2) {
  return [user1, user2].sort().join('_');
}

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173', // Adjust if deployed
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Join a unique room based on sender/receiver ID
    socket.on('join_room', ({ senderId, receiverId }) => {
      const roomId = generateRoomId(senderId, receiverId);
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Send message (text, image, file, video)
    // The `data` object now includes `tempId` from the frontend
    socket.on('send_message', async (data, callback) => {
      const { senderId, receiverId, message, type = 'text', fileUrl = '', tempId } = data; // Destructure tempId
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

        // --- THE CRUCIAL CHANGE IS HERE ---
        // 1. Emit the saved message to all clients in the room *EXCEPT the sender*.
        // The sender will receive `message_confirmed` instead.
        socket.to(roomId).emit('receive_message', savedMessage.toObject()); // Changed from io.to(roomId) to socket.to(roomId)

        // 2. Emit confirmation specifically to the sender's socket
        // This tells the sender's client to replace their optimistic message
        // with the real, persisted message from the database.
        io.to(socket.id).emit('message_confirmed', {
          tempId: tempId, // Original temporary ID from the frontend
          realMessage: savedMessage.toObject(), // The actual message object from the DB
        });

        // Callback for acknowledgment (optional, can be used for direct sender feedback)
        if (callback) callback({ success: true, realMessage: savedMessage.toObject() });

      } catch (err) {
        console.error('Error saving message:', err.message);
        // Inform the sender if saving failed via a specific event
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