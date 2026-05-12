import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Message from './models/Message.js'
import User from './models/User.js'

dotenv.config()

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      console.log('Connected to DB')
      // Fetch 1 message
      const msg = await Message.findOne().populate('sender', 'name avatar').populate({ path: 'replyTo', select: 'content sender imageUrl audioUrl', populate: { path: 'sender', select: 'name username' } }).lean()
      console.log('Test fetch success:', !!msg)
    } catch(err) {
      console.error('Fetch error:', err)
    }
    process.exit(0)
  })
