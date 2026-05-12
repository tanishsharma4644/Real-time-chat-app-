import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

const uri = process.env.MONGODB_URI || process.env.MONGO_URI
if (!uri) {
  console.error('No Mongo URI in env')
  process.exit(1)
}

const main = async () => {
  await mongoose.connect(uri)
  const u = await User.findOne({ email: 'demo@chat.com' }).lean()
  console.log('Demo user from DB:', u)
  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
