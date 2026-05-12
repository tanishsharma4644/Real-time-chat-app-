import express from 'express'
import { getAllUsers, getUserById, updateProfile } from '../controllers/userController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', protect, getAllUsers)
router.get('/:id', protect, getUserById)
router.put('/profile', protect, updateProfile)

export default router

