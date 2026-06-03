import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { Search, Video, Phone, MoreVertical, Check, CheckCheck, Trash2, Smile, Reply } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { useCall } from '../../context/CallContext'
import MessageInput from './MessageInput'

const getRoomTitle = (room, currentUserId) => {
  if (!room) return 'Select a room'
  if (room.isGroup) return room.name || 'Group chat'

  const partner = room.members?.find((member) => member._id !== currentUserId)
  return partner?.name || partner?.username || 'Direct chat'
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥']

const ChatWindow = () => {
  const { user } = useAuth()
  const messagesEndRef = useRef(null)
  const {
    activeRoom,
    messages,
    typingUserId,
    users,
    markAsRead,
    reactToMessage,
    deleteMessage,
    onlineUsers,
    setReplyingTo,
  } = useChat()

  const { callUser } = useCall()

  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const displayMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages
    const q = searchQuery.toLowerCase()
    return messages.filter(m => m.content?.toLowerCase().includes(q))
  }, [messages, searchQuery])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayMessages, typingUserId])

  useEffect(() => {
    if (!activeRoom) return
    const lastMsgId = displayMessages.length > 0 ? displayMessages[displayMessages.length - 1]._id : activeRoom.lastMessage?._id
    if (lastMsgId) {
      markAsRead(lastMsgId)
    }
  }, [activeRoom?._id, displayMessages.length])

  const typingUser = users.find((person) => person._id === typingUserId)

  if (!activeRoom) {
    return (
      <section className="grid h-full place-items-center relative z-0">
        <p className="text-lg font-medium text-[rgba(255,255,255,0.4)]">Choose a conversation to begin</p>
      </section>
    )
  }

  const isDirect = !activeRoom.isGroup
  const partnerId = isDirect ? activeRoom.participants?.find((p) => p._id !== user._id)?._id || activeRoom.members?.find((p) => p._id !== user._id)?._id : null
  const isOnline = isDirect && onlineUsers[partnerId] === 'online'

  const letter = (activeRoom.name || getRoomTitle(activeRoom, user._id) || 'G').slice(0,1).toUpperCase()
  let gradient = 'linear-gradient(135deg, #667eea, #764ba2)'
  if (/[G-L]/.test(letter)) gradient = 'linear-gradient(135deg, #11998e, #38ef7d)'
  else if (/[M-R]/.test(letter)) gradient = 'linear-gradient(135deg, #f093fb, #f5576c)'
  else if (/[S-Z]/.test(letter)) gradient = 'linear-gradient(135deg, #f7971e, #ffd200)'

  return (
    <section className="flex h-full flex-col relative z-0 min-h-0">
      <header className="flex items-center justify-between px-[24px] h-[76px] bg-[#0a0d14]/80 backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.06)] z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className={`h-[50px] w-[50px] rounded-[18px] flex items-center justify-center text-[16px] font-bold text-white shadow-lg transition-all duration-300 ${typingUser ? 'shadow-[0_0_0_2px_#13161f,0_0_0_4px_#a78bfa] animate-pulse' : isOnline ? 'shadow-[0_0_0_2px_#13161f,0_0_0_4px_#22c55e]' : ''}`} style={{ background: gradient }}>
            {letter}
            {isOnline && <span className="absolute -right-1 -bottom-1 h-[14px] w-[14px] rounded-full bg-transparent border-[3px] border-[#0a0d14]" style={{ background: '#22c55e' }}></span>}
          </div>
          <div>
            <div className="text-[16px] font-bold text-white tracking-tight">{getRoomTitle(activeRoom, user._id)}</div>
            <div className="flex items-center gap-[6px] mt-0.5">
              {isOnline ? (
                 <div className="text-[13px] text-[rgba(255,255,255,0.5)]"><span className="text-[#22c55e]">● Online</span> • last seen recently</div>
              ) : (
                 <div className="text-[13px] text-[rgba(255,255,255,0.4)]">{!isDirect ? `${activeRoom.members?.length || 0} members` : `Last seen ${activeRoom.lastSeen || 'recently'}`}</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[12px]">
          {isSearching && (
            <input 
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat..."
              className="input-search px-4 rounded-[12px] h-[40px] w-48 text-sm text-white placeholder-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] focus:border-[#6c63ff] transition-all"
            />
          )}
          {!activeRoom.isGroup && (
            <button onClick={() => {}} className="w-[42px] h-[42px] rounded-[16px] flex items-center justify-center border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)] hover:text-[#22c55e] hover:bg-[rgba(34,197,94,0.1)] hover:border-[#22c55e]/30 hover:scale-105 transition-all duration-200">
              <Phone size={18} />
            </button>
          )}
          {!activeRoom.isGroup && (
            <button onClick={() => callUser(partnerId)} className="w-[42px] h-[42px] rounded-[16px] flex items-center justify-center border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)] hover:text-[#6c63ff] hover:bg-[rgba(108,99,255,0.1)] hover:border-[#6c63ff]/30 hover:scale-105 transition-all duration-200">
              <Video size={18} />
            </button>
          )}
          <button onClick={() => { setIsSearching(!isSearching); setSearchQuery('') }} className={`w-[42px] h-[42px] rounded-[16px] flex items-center justify-center border transition-all duration-200 ${isSearching ? 'border-[#6c63ff] bg-[rgba(108,99,255,0.1)] text-[#6c63ff] scale-105' : 'border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] hover:scale-105'}`}>
            <Search size={18} />
          </button>
          <button onClick={() => alert('Options menu coming soon!')} className="w-[42px] h-[42px] rounded-[16px] flex items-center justify-center border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] hover:scale-105 transition-all duration-200">
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-thin relative z-0">
        <div className="flex items-center gap-4 my-8">
           <div className="h-[1px] flex-1 bg-[rgba(255,255,255,0.03)]"></div>
           <div className="text-[11px] font-medium text-[rgba(255,255,255,0.2)] tracking-wide">Today • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</div>
           <div className="h-[1px] flex-1 bg-[rgba(255,255,255,0.03)]"></div>
        </div>
        
        {displayMessages.map((message) => {
          const mine = message.sender?._id === user._id || message.sender === user._id
          const readByOther = (message.readBy?.length > 0 && message.readBy.some(id => id !== user._id))
          
          return (
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              key={message._id} 
              className={`message-enter mb-6 max-w-[70%] group relative ${mine ? 'ml-auto' : 'mr-auto'}`}
            >
              <div className={`flex items-end gap-3 relative ${mine ? 'justify-end' : 'justify-start'}`}>
                
                {!mine && (
                  <div className="w-[36px] h-[36px] rounded-[12px] flex items-center justify-center text-[13px] font-bold text-white shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #a78bfa, #8b85ff)' }}>
                    {message.sender?.name?.[0]?.toUpperCase() || message.sender?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                
                <div className={`flex flex-col relative max-w-[calc(100%-48px)] ${mine ? 'items-end' : 'items-start'}`}>
                  {message.replyTo && (
                    <div className="mb-[6px] p-[8px_12px] rounded-xl bg-[rgba(255,255,255,0.05)] border-l-[3px] border-[#a78bfa] text-[13px] opacity-90 backdrop-blur-md">
                      <div className="font-semibold text-white/90 mb-[2px]">{message.replyTo.sender?.name || message.replyTo.sender?.username}</div>
                      <div className="text-[rgba(255,255,255,0.6)] truncate">{message.replyTo.content || (message.replyTo.imageUrl ? 'Photo' : 'Audio')}</div>
                    </div>
                  )}

                  <motion.div 
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={(e, info) => { if (info.offset.x > 50) setReplyingTo(message) }}
                    className={`${mine ? 'msg-sender self-end' : 'msg-receiver self-start'} relative cursor-grab active:cursor-grabbing hover:shadow-[0_8px_25px_rgba(108,99,255,0.4)] transition-shadow duration-300`}
                    style={!mine ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' } : {}}
                  >
                    
                    {/* Hover actions */}
                    <div className={`absolute top-1/2 -translate-y-1/2 ${mine ? '-left-[90px]' : '-right-[90px]'} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200`}>
                      <button onClick={() => setReplyingTo(message)} className="p-[8px] rounded-full text-[rgba(255,255,255,0.3)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all">
                        <Reply size={16} />
                      </button>
                      {mine && (
                        <button onClick={() => { if(window.confirm('Delete this message?')) deleteMessage(message._id) }} className="p-[8px] rounded-full text-[rgba(255,255,255,0.3)] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.15)] transition-all">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="reaction-picker">
                      {EMOJIS.map(em => (
                        <button key={em} className="reaction-btn" onClick={() => reactToMessage(message._id, em)}>{em}</button>
                      ))}
                    </div>
                    
                    {!mine && activeRoom.isGroup && <div className="mb-[4px] text-[13px] font-semibold text-white/90">{message.sender?.name || message.sender?.username}</div>}
                    
                    {message.content && <div className="whitespace-pre-wrap relative z-10">{message.content}</div>}
                    {message.imageUrl && <img src={message.imageUrl} alt="attachment" className="mt-[8px] max-w-[260px] rounded-xl object-cover shadow-[0_4px_12px_rgba(0,0,0,0.3)] cursor-pointer hover:opacity-90 transition-opacity relative z-10" onClick={() => window.open(message.imageUrl, '_blank')} />}
                  </motion.div>
                  
                  {/* Timestamp & Status outside bubble */}
                  <div className={`flex items-center gap-[4px] mt-[6px] text-[11px] text-[rgba(255,255,255,0.3)] ${mine ? 'justify-end' : 'justify-start ml-2'}`}>
                    <span>{new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    {mine && (
                      <span className="ml-[2px]">
                        {readByOther ? <CheckCheck size={14} className="text-[#00f2fe]" /> : <Check size={14} className="text-[rgba(255,255,255,0.3)]" />}
                      </span>
                    )}
                  </div>
                  
                  {/* Reactions floating on edge */}
                  {(message.reactions || []).length > 0 && (
                    <div className={`absolute -bottom-[12px] ${mine ? 'right-[12px]' : 'left-[12px]'} flex gap-1 z-20`}>
                      {(message.reactions || []).map((r, i) => (
                        <div key={i} className="flex items-center justify-center rounded-full bg-[#13161f] border border-[rgba(255,255,255,0.1)] px-[6px] py-[2px] text-[11px] shadow-lg">
                          {r.emoji} <span className="ml-1 text-[rgba(255,255,255,0.6)]">1</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.article>
            )
          })}

        <AnimatePresence>
          {typingUser && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="typing-bubble"
            >
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <MessageInput />
    </section>
  )
}

export default ChatWindow
