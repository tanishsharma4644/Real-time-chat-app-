/**
 * User controller
 */
import User from '../models/User.js'

/**
 * Get all users except the logged-in user
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('name email avatar avatarGradient isOnline lastSeen')
      .sort({ name: 1 })
      .lean()

    res.json({ success: true, data: users })
  } catch (err) {
    next(err)
  }
}

/**
 * Get a single user by id
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id).select('name email avatar avatarGradient isOnline lastSeen').lean()
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

/**
 * Update profile (name, avatar)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const updates = {}
    if (req.body.name) updates.name = req.body.name
    if (req.body.avatar) updates.avatar = req.body.avatar

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('name email avatar avatarGradient isOnline lastSeen').lean()
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

export default { getAllUsers, getUserById, updateProfile }

