import express from 'express'
import { register, login, refreshToken, logout, getMe } from '../controllers/authController.js'
import { authRateLimiter } from '../middlewares/rateLimiter.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/register', authRateLimiter, register)
router.post('/login', authRateLimiter, login)
router.post('/refresh', refreshToken)
router.post('/logout', protect, logout)
router.get('/me', protect, getMe)

export default router

