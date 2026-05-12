import express from 'express'
import { accessOrCreateChat, getUserChats, createGroupChat, updateGroupChat, deleteChat } from '../controllers/chatController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.get('/', getUserChats)
router.post('/', accessOrCreateChat)
router.post('/group', createGroupChat)
router.put('/group/:id', updateGroupChat)
router.delete('/:id', deleteChat)

export default router
 
