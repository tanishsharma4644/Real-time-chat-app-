const jwt = require('jsonwebtoken');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const { sortRoomMessages } = require('../controllers/chatController');

const userSockets = new Map();

const attachUserSocket = (userId, socketId) => {
  const existing = userSockets.get(userId) || new Set();
  existing.add(socketId);
  userSockets.set(userId, existing);
};

const detachUserSocket = (userId, socketId) => {
  const existing = userSockets.get(userId);

  if (!existing) {
    return false;
  }

  existing.delete(socketId);

  if (existing.size === 0) {
    userSockets.delete(userId);
    return true;
  }

  userSockets.set(userId, existing);
  return false;
};

const emitUserStatus = (io, userId, status) => {
  io.emit('user_status', { userId, status });
};

const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Unauthorized'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: decoded.id };
    next();
  } catch (error) {
    next(new Error('Unauthorized'));
  }
};

const registerSocketHandlers = (io) => {
  io.use(authenticateSocket);

  io.on('connection', async (socket) => {
    const userId = socket.user.id;

    attachUserSocket(userId, socket.id);
    emitUserStatus(io, userId, 'online');

    socket.on('join_room', async ({ roomId }) => {
      const room = await ChatRoom.findOne({ _id: roomId, participants: userId });
      if (!room) return;
      socket.join(roomId);
    });

    socket.on('leave_room', ({ roomId }) => {
      socket.leave(roomId);
    });

    socket.on('send_message', async (payload) => {
      try {
        const { roomId, content = '', imageUrl = '' } = payload;
        const room = await ChatRoom.findOne({ _id: roomId, participants: userId });

        if (!room) {
          return;
        }

        const messageType = content && imageUrl ? 'mixed' : imageUrl ? 'image' : 'text';

        const message = await Message.create({
          chatRoom: roomId,
          sender: userId,
          content,
          imageUrl,
          type: messageType,
          readBy: [userId],
        });

        await sortRoomMessages(roomId);

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username email avatar')
          .populate('readBy', 'username email avatar');

        io.to(roomId).emit('receive_message', populatedMessage);
      } catch (error) {
        socket.emit('socket_error', { message: error.message });
      }
    });

    socket.on('typing_start', ({ roomId }) => {
      socket.to(roomId).emit('typing_start', { roomId, userId });
    });

    socket.on('typing_end', ({ roomId }) => {
      socket.to(roomId).emit('typing_end', { roomId, userId });
    });

    socket.on('message_read', async ({ roomId }) => {
      await Message.updateMany(
        {
          chatRoom: roomId,
          sender: { $ne: userId },
          readBy: { $ne: userId },
        },
        { $addToSet: { readBy: userId } }
      );

      io.to(roomId).emit('messages_read', { roomId, userId });
    });

    socket.on('reaction', async ({ roomId, messageId, emoji }) => {
      const message = await Message.findById(messageId);

      if (!message) {
        return;
      }

      const existingReaction = message.reactions.find(
        (reaction) => reaction.user.toString() === userId
      );

      if (existingReaction) {
        existingReaction.emoji = emoji;
      } else {
        message.reactions.push({ user: userId, emoji });
      }

      await message.save();

      io.to(roomId).emit('reaction_updated', {
        roomId,
        messageId,
        reactions: message.reactions,
      });
    });

    socket.on('disconnect', () => {
      const wentOffline = detachUserSocket(userId, socket.id);

      if (wentOffline) {
        emitUserStatus(io, userId, 'offline');
      }
    });
  });
};

module.exports = registerSocketHandlers;
