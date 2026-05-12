/**
 * Seed a demo user if not present
 */
import User from '../models/User.js'

export const seedDemo = async () => {
  try {
    const email = 'demo@chat.com'
    const existing = await User.findOne({ email }).lean()
    if (existing) {
      if (!existing.name && existing.username) {
        await User.updateOne({ _id: existing._id }, { $set: { name: existing.username } })
      }
      console.log('✅ Demo user already exists')
      return
    }

    const username = `demo_${Date.now()}`
    const demo = new User({ name: 'Demo User', email, password: 'demo123', username })
    await demo.save()
    console.log('✅ Demo user seeded: demo@chat.com / demo123')
  } catch (error) {
    console.error('Failed to seed demo user:', error)
  }
}

export default seedDemo
