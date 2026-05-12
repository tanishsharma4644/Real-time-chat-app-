import express from 'express'
import { getMessages, sendMessage, searchMessages, addReaction, deleteMessage } from '../controllers/messageController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/:chatId', protect, getMessages)
router.post('/', protect, sendMessage)
router.get('/:chatId/search', protect, searchMessages)
router.post('/:messageId/reaction', protect, addReaction)
router.delete('/:messageId', protect, deleteMessage)

export default router
