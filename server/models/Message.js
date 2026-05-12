/**
 * Message model
 */
import mongoose from 'mongoose'

const { Schema } = mongoose

const MessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    content: { type: String, trim: true, default: '' },
    imageUrl: { type: String, default: '' },
    audioUrl: { type: String, default: '' },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
    reactions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        emoji: { type: String },
      },
    ],
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

MessageSchema.index({ chat: 1, createdAt: -1 })

const Message = mongoose.model('Message', MessageSchema)
export default Message

