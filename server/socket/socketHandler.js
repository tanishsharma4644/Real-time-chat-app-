import jwt from 'jsonwebtoken'
import Message from '../models/Message.js'
import Chat from '../models/Chat.js'
import User from '../models/User.js'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const onlineUsers = new Map() // userId -> socketId

export function initSocket(io) {
  io.on('connection', (socket) => {
    socket.on('authenticate', async ({ token }) => {
      try {
        if (!token) return socket.emit('unauthorized')
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        const user = await User.findById(payload.id).lean()
        if (!user) return socket.emit('unauthorized')

        socket.user = user
        onlineUsers.set(user._id.toString(), socket.id)
        socket.join(user._id.toString())
        io.emit('online_users', Array.from(onlineUsers.keys()))
      } catch (err) {
        socket.emit('unauthorized')
      }
    })

    socket.on('join_chat', (chatId) => {
      if (!chatId) return
      socket.join(chatId)
    })

    socket.on('leave_chat', (chatId) => {
      if (!chatId) return
      socket.leave(chatId)
    })

    socket.on('typing_start', ({ chatId }) => {
      if (!chatId) return
      socket.to(chatId).emit('typing_start', { chatId, user: socket.user })
    })

    socket.on('typing_end', ({ chatId }) => {
      if (!chatId) return
      socket.to(chatId).emit('typing_end', { chatId, user: socket.user })
    })

    socket.on('send_message', async ({ chatId, content = '', imageUrl = '', audioUrl = '', replyTo }) => {
      try {
        if (!socket.user) return socket.emit('unauthorized')
        const message = await Message.create({ sender: socket.user._id, chat: chatId, content, imageUrl, audioUrl, replyTo: replyTo || undefined })
        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id })
        const populated = await Message.findById(message._id)
          .populate('sender', 'name avatar avatarGradient')
          .populate({ path: 'replyTo', select: 'content sender imageUrl audioUrl', populate: { path: 'sender', select: 'name username' } })
          .lean()
        io.to(chatId).emit('receive_message', populated)

        // notify offline members
        const chat = await Chat.findById(chatId).populate('members', '_id')
        chat.members.forEach((m) => {
          const sid = onlineUsers.get(m._id.toString())
          if (!sid) {
            // here you could enqueue push notifications or emit to personal room; keep simple
          }
        })
      } catch (err) {
        socket.emit('error', { message: 'Message send failed' })
      }
    })

    socket.on('message_read', async ({ chatId, messageId }) => {
      try {
        if (!socket.user) return
        const message = await Message.findById(messageId)
        if (!message) return
        if (!message.readBy.includes(socket.user._id)) {
          message.readBy.push(socket.user._id)
          await message.save()
        }
        io.to(chatId).emit('read_receipt', { messageId, userId: socket.user._id })
      } catch (err) {
        // ignore
      }
    })

    socket.on('add_reaction', async ({ messageId, emoji }) => {
      try {
        if (!socket.user) return
        const message = await Message.findById(messageId)
        if (!message) return
        const idx = message.reactions.findIndex(r => r.userId.toString() === socket.user._id.toString())
        if (idx > -1) {
          if (message.reactions[idx].emoji === emoji) {
            message.reactions.splice(idx, 1)
          } else {
            message.reactions[idx].emoji = emoji
          }
        } else {
          message.reactions.push({ userId: socket.user._id, emoji })
        }
        await message.save()
        const updated = await Message.findById(messageId).populate('sender', 'name avatar').lean()
        io.to(message.chat.toString()).emit('reaction_updated', updated)
      } catch (err) {
        // ignore
      }
    })

    socket.on('delete_message', async ({ chatId, messageId }) => {
      try {
        if (!socket.user) return
        io.to(chatId).emit('message_deleted', { messageId, chatId })
      } catch (err) {
        // ignore
      }
    })

    // WebRTC Signaling for Voice/Video Calls
    socket.on('call_user', ({ userToCall, signalData, from, name }) => {
      const socketId = onlineUsers.get(userToCall.toString())
      if (socketId) {
        io.to(socketId).emit('call_incoming', { signal: signalData, from, name })
      }
    })

    socket.on('answer_call', (data) => {
      const socketId = onlineUsers.get(data.to.toString())
      if (socketId) {
        io.to(socketId).emit('call_accepted', data.signal)
      }
    })

    socket.on('end_call', ({ to }) => {
      if (!to) return
      const socketId = onlineUsers.get(to.toString())
      if (socketId) {
        io.to(socketId).emit('call_ended')
      }
    })

    socket.on('disconnect', () => {
      if (socket.user) {
        onlineUsers.delete(socket.user._id.toString())
        io.emit('online_users', Array.from(onlineUsers.keys()))
      }
    })
  })
}

export default initSocket
