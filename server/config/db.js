/**
 * Connect to MongoDB Atlas using MONGODB_URI env
 */
import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI
    if (!uri) throw new Error('MONGODB_URI or MONGO_URI is not defined in environment')

    mongoose.set('strictQuery', false)
    const conn = await mongoose.connect(uri)
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

export default connectDB

