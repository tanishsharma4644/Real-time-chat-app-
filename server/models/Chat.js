/**
 * Chat model
 */
import mongoose from 'mongoose'

const { Schema } = mongoose

const ChatSchema = new Schema(
  {
    isGroupChat: { type: Boolean, default: false },
    name: { type: String, trim: true },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    admin: { type: Schema.Types.ObjectId, ref: 'User' },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    groupAvatar: { type: String, default: '' },
  },
  { timestamps: true }
)

// Validate minimum members when saving a chat
ChatSchema.pre('save', function (next) {
  if (!this.isGroupChat && this.members.length < 2) {
    return next(new Error('Direct chats must have at least 2 members'))
  }
  next()
})

const Chat = mongoose.model('Chat', ChatSchema)
export default Chat
