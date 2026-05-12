/**
 * Chat controller
 */
import Chat from '../models/Chat.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import mongoose from 'mongoose'

/**
 * Access or create a one-on-one chat
 * Receives: { userId }
 */
export const accessOrCreateChat = async (req, res, next) => {
  try {
    const otherId = req.body.userId
    if (!otherId) return res.status(400).json({ success: false, message: 'userId is required' })
    if (!mongoose.Types.ObjectId.isValid(otherId)) return res.status(400).json({ success: false, message: 'Invalid userId' })

    const members = [req.user._id.toString(), otherId]

    let chat = await Chat.findOne({ isGroupChat: false, members: { $all: members, $size: 2 } })
      .populate('members', 'name email avatar isOnline')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name avatar' } })
      .lean()

    if (!chat) {
      const created = await Chat.create({ isGroupChat: false, members })
      chat = await Chat.findById(created._id)
        .populate('members', 'name email avatar isOnline')
        .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name avatar' } })
        .lean()
    }

    res.json({ success: true, data: chat })
  } catch (err) {
    next(err)
  }
}

/**
 * Get all chats for user
 */
export const getUserChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ members: req.user._id })
      .populate('members', 'name email avatar avatarGradient isOnline lastSeen')
      .populate({ path: 'lastMessage', select: 'content imageUrl createdAt', populate: { path: 'sender', select: 'name' } })
      .sort({ updatedAt: -1 })
      .lean()

    res.json({ success: true, data: chats })
  } catch (err) {
    next(err)
  }
}

/**
 * Create group chat
 * Receives: { name, members: [id,...] }
 */
export const createGroupChat = async (req, res, next) => {
  try {
    const { name, members = [] } = req.body
    if (!name || !Array.isArray(members) || members.length < 2) return res.status(400).json({ success: false, message: 'Group name and at least 2 members required' })

    const unique = Array.from(new Set([...members.map(String), req.user._id.toString()]))
    const chat = await Chat.create({ isGroupChat: true, name, members: unique, admin: req.user._id })
    const populated = await Chat.findById(chat._id).populate('members', 'name email avatar').populate('admin', 'name email avatar').lean()
    res.status(201).json({ success: true, data: populated })
  } catch (err) {
    next(err)
  }
}

/**
 * Update group chat (only admin)
 * Params: :id
 */
export const updateGroupChat = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid chat id' })

    const chat = await Chat.findById(id)
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' })
    if (chat.admin?.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Only admin can update group' })

    const updates = {}
    if (req.body.name) updates.name = req.body.name
    if (req.body.members) updates.members = req.body.members

    const updated = await Chat.findByIdAndUpdate(id, updates, { new: true })
      .populate('members', 'name email avatar')
      .populate('admin', 'name email avatar')
      .lean()

    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
}

export const deleteChat = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid chat id' })

    const chat = await Chat.findById(id)
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' })

    // Optional: check if user is in chat
    if (!chat.members.includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this chat' })
    }

    await Chat.findByIdAndDelete(id)
    res.json({ success: true, message: 'Chat deleted' })
  } catch (err) {
    next(err)
  }
}

export default { accessOrCreateChat, getUserChats, createGroupChat, updateGroupChat, deleteChat }
 
