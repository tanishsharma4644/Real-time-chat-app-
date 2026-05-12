/**
 * Server entrypoint
 * - Configures express app, middleware, routes, error handling
 * - Connects to MongoDB and seeds demo user
 * - Initializes Socket.io handlers
 */
import http from 'http'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

dotenv.config()

import connectDB from './config/db.js'
import { seedDemo } from './utils/seedDemo.js'
import initSocket from './socket/socketHandler.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import errorHandler from './middlewares/errorHandler.js'

const app = express()
const server = http.createServer(app)

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

import { Server } from 'socket.io'
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
})

// Basic middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Mount routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/upload', uploadRoutes)

// Global error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000

// Connect DB then start server
const start = async () => {
  try {
    await connectDB()
    await seedDemo()
    initSocket(io)

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
 

export { io }
