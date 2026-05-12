/**
 * Global error handler
 */
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

const errorHandler = (err, req, res, next) => {
  // Default
  let statusCode = 500
  let message = 'Internal server error'

  // Mongoose bad ObjectId
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400
    message = 'Invalid ID format'
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400
    const errors = Object.values(err.errors).map(e => e.message)
    message = errors.join('. ')
  }

  // Duplicate key
  if (err.code && err.code === 11000) {
    statusCode = 400
    message = 'Duplicate key error'
    if (err.keyValue && err.keyValue.email) message = 'Email already exists'
  }

  // JWT errors
  if (err instanceof jwt.TokenExpiredError) {
    statusCode = 401
    message = 'Token expired'
  }
  if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401
    message = 'Invalid token'
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(err)
  }

  res.status(statusCode).json({ success: false, message })
}

export default errorHandler
