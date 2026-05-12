/**
 * Message controller: pagination, send, search, reactions
 */
import Message from '../models/Message.js'
import Chat from '../models/Chat.js'
import mongoose from 'mongoose'

/**
 * Get messages for a chat with pagination
 * Query: ?page=1&limit=20
 */
export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const page = Math.max(1, Number(req.query.page || 1))
    const limit = Math.max(1, Number(req.query.limit || 20))

    if (!mongoose.Types.ObjectId.isValid(chatId)) return res.status(400).json({ success: false, message: 'Invalid chat id' })

    const filter = { chat: chatId }
    const total = await Message.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)

    const messages = await Message.find(filter)
      .populate('sender', 'name avatar avatarGradient')
      .populate({ path: 'replyTo', select: 'content sender imageUrl audioUrl', populate: { path: 'sender', select: 'name username' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    res.json({ success: true, data: { messages: messages.reverse(), page, totalPages, hasMore: page < totalPages } })
  } catch (err) {
    next(err)
  }
}

/**
 * Send a message (fallback endpoint) - saves message and updates chat.lastMessage
 */
  export const sendMessage = async (req, res, next) => {
    try {
      const { chatId, content = '', imageUrl = '', audioUrl = '', replyTo } = req.body
      if (!chatId) return res.status(400).json({ success: false, message: 'chatId is required' })
      if (!mongoose.Types.ObjectId.isValid(chatId)) return res.status(400).json({ success: false, message: 'Invalid chat id' })
  
      const message = await Message.create({ sender: req.user._id, chat: chatId, content, imageUrl, audioUrl, replyTo: replyTo || undefined })
      await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id })
      const populated = await Message.findById(message._id)
        .populate('sender', 'name avatar avatarGradient')
        .populate({ path: 'replyTo', select: 'content sender imageUrl audioUrl', populate: { path: 'sender', select: 'name username' } })
        .lean()
    res.status(201).json({ success: true, data: populated })
  } catch (err) {
    next(err)
  }
}

/**
 * Search messages by content in a chat
 */
export const searchMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params
    const q = req.query.q || ''
    if (!mongoose.Types.ObjectId.isValid(chatId)) return res.status(400).json({ success: false, message: 'Invalid chat id' })

    const messages = await Message.find({ chat: chatId, content: { $regex: q, $options: 'i' } })
      .limit(30)
      .populate('sender', 'name avatar avatarGradient')
      .sort({ createdAt: -1 })
      .lean()

    res.json({ success: true, data: messages })
  } catch (err) {
    next(err)
  }
}

/**
 * Add or toggle reaction on a message
 */
export const addReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params
    const { emoji } = req.body
    if (!emoji) return res.status(400).json({ success: false, message: 'Emoji required' })
    if (!mongoose.Types.ObjectId.isValid(messageId)) return res.status(400).json({ success: false, message: 'Invalid message id' })

    const message = await Message.findById(messageId)
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' })

    const existingIndex = message.reactions.findIndex(r => r.userId?.toString() === req.user._id.toString())
    if (existingIndex > -1) {
      // toggle off if same emoji
      if (message.reactions[existingIndex].emoji === emoji) {
        message.reactions.splice(existingIndex, 1)
      } else {
        message.reactions[existingIndex].emoji = emoji
      }
    } else {
      message.reactions.push({ userId: req.user._id, emoji })
    }

    await message.save()
    const updated = await Message.findById(messageId).populate('sender', 'name avatar').lean()
    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
}

export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params
    if (!mongoose.Types.ObjectId.isValid(messageId)) return res.status(400).json({ success: false, message: 'Invalid message id' })

    const message = await Message.findById(messageId)
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' })

    // Check if the user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this message' })
    }

    await Message.findByIdAndDelete(messageId)
    res.json({ success: true, message: 'Message deleted successfully', data: { messageId, chatId: message.chat } })
  } catch (err) {
    next(err)
  }
}

export default { getMessages, sendMessage, searchMessages, addReaction, deleteMessage }
