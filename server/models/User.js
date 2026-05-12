/**
 * User model
 * - name, email, password, avatar, avatarGradient, isOnline, lastSeen
 */
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const { Schema } = mongoose

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    username: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: '' },
    avatarGradient: { type: String, default: 'indigo' },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// Hash password before saving
UserSchema.pre('save', async function (next) {
  // ensure compatibility with older docs that used `username`
  if (!this.name && this.username) this.name = this.username

  if (!this.isModified('password')) return next()
  const saltRounds = 12
  const hash = await bcrypt.hash(this.password, saltRounds)
  this.password = hash
  next()
})

// Instance method: compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', UserSchema)
export default User

