/**
 * Upload controller using multer memory and Cloudinary
 */
import cloudinary from '../config/cloudinary.js'

/**
 * Upload image buffer to Cloudinary
 * Expects multer memory storage on req.file
 */
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) return res.status(400).json({ success: false, message: 'No file uploaded' })

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'chat-app', resource_type: 'auto' }, (error, uploaded) => {
        if (error) return reject(error)
        resolve(uploaded)
      })
      stream.end(req.file.buffer)
    })

    res.status(201).json({ success: true, data: { url: result.secure_url, publicId: result.public_id } })
  } catch (err) {
    next(err)
  }
}

export default { uploadImage }
