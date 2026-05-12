import { useState, useRef } from 'react'
import { Smile, Send, Loader2, Image as ImageIcon, Mic, X } from 'lucide-react'
import Picker from 'emoji-picker-react'
import { useChat } from '../../context/ChatContext'

const MessageInput = () => {
  const { sendMessage, setTyping, uploadImage, replyingTo, setReplyingTo } = useChat()
  const [content, setContent] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const fileInputRef = useRef(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!content.trim()) return
    sendMessage({ content: content.trim() })
    setContent('')
    setTyping(false)
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const imageUrl = await uploadImage(file)
      sendMessage({ content: '', imageUrl })
    } catch (err) {
      console.error('Image upload failed:', err)
      alert('Failed to upload image. Please check your Cloudinary configuration or try again.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="input-container relative z-20">
      {replyingTo && (
        <div className="absolute top-[-56px] left-[24px] right-[24px] p-[8px_16px] bg-[rgba(30,33,48,0.95)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-t-[16px] flex items-center justify-between z-10">
          <div className="flex-1 min-w-0 border-l-[3px] border-[#a78bfa] pl-[10px]">
            <div className="text-[12px] font-semibold text-[#a78bfa] mb-[2px]">Replying to {replyingTo.sender?.name || replyingTo.sender?.username}</div>
            <div className="text-[13px] text-[rgba(255,255,255,0.6)] truncate">{replyingTo.content || (replyingTo.imageUrl ? 'Photo' : 'Audio')}</div>
          </div>
          <button onClick={() => setReplyingTo(null)} className="ml-4 p-2 text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {showPicker && (
        <div className="absolute bottom-[90px] left-[24px] z-50 shadow-2xl rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
          <Picker onEmojiClick={(emojiData) => setContent(prev => prev + emojiData.emoji)} theme="dark" />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="input-wrapper group">
        <button type="button" onClick={() => setShowPicker(!showPicker)} className="text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.8)] hover:scale-110 transition-all duration-200 cursor-pointer">
          <Smile size={22} />
        </button>

        <input
          value={content}
          onChange={(event) => {
            const value = event.target.value
            setContent(value)
            setTyping(Boolean(value.trim()))
          }}
          onBlur={() => setTyping(false)}
          placeholder="Type a message..."
          className="input-field"
        />

        <div className="flex items-center gap-[12px]">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.8)] hover:scale-110 transition-all duration-200 cursor-pointer disabled:opacity-50">
            {uploading ? <Loader2 size={20} className="animate-spin text-[#6c63ff]" /> : <ImageIcon size={20} />}
          </button>
          <button type="button" onClick={() => alert('Voice notes coming soon!')} className="text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.8)] hover:scale-110 transition-all duration-200 cursor-pointer">
            <Mic size={20} />
          </button>
          <button type="submit" disabled={!content.trim() && !uploading} className={`btn-send ${content.trim() ? 'opacity-100 scale-105 shadow-[0_4px_15px_rgba(108,99,255,0.6)]' : 'opacity-70'}`}>
            <Send size={18} className={content.trim() ? 'translate-x-[1px]' : ''} color="white" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default MessageInput
