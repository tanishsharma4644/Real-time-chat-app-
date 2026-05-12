/**
 * Authentication controller
 * - register, login, refreshToken, logout
 */
import User from '../models/User.js'
import { generateTokens } from '../utils/generateTokens.js'
import { setRefreshCookie } from '../utils/setCookie.js'
import jwt from 'jsonwebtoken'

/**
 * Register a new user
 * Receives: { name, email, password }
 * Returns: { success: true, data: { user, accessToken } }
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Missing fields' })

    const exists = await User.findOne({ email }).lean()
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' })

    const username = `user_${Date.now()}_${Math.floor(Math.random() * 10000)}`
    const user = new User({ name, email, password, username })
    await user.save()

    const { accessToken, refreshToken } = generateTokens(user._id)
    setRefreshCookie(res, refreshToken)

    const userToReturn = await User.findById(user._id).select('-password').lean()
    res.status(201).json({ success: true, data: { user: userToReturn, accessToken } })
  } catch (err) {
    next(err)
  }
}

/**
 * Login user
 * Receives: { email, password }
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ success: false, message: 'Missing credentials' })

    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    const match = await user.comparePassword(password)
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    // Support legacy demo records that may still have `username` instead of `name`
    if (!user.name && user.username) {
      user.name = user.username
    }

    await User.findByIdAndUpdate(user._id, { isOnline: true, lastSeen: Date.now(), name: user.name || user.username })

    const { accessToken, refreshToken } = generateTokens(user._id)
    setRefreshCookie(res, refreshToken)

    const userToReturn = await User.findById(user._id).select('-password').lean()
    res.json({ success: true, data: { user: userToReturn, accessToken } })
  } catch (err) {
    next(err)
  }
}

/**
 * Refresh access token using refresh cookie
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' })

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id).lean()
    if (!user) return res.status(401).json({ success: false, message: 'User not found' })

    const { accessToken } = generateTokens(user._id)
    res.json({ success: true, data: { accessToken } })
  } catch (err) {
    next(err)
  }
}

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        await User.findByIdAndUpdate(decoded.id, { isOnline: false, lastSeen: Date.now() })
      } catch (e) {
        // ignore
      }
    }

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' })
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (err) {
    next(err)
  }
}

/**
 * Get current logged in user
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean()
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

export default { register, login, refreshToken, logout, getMe }
