import { useState, useMemo, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Search, Video, MoreVertical, Check, CheckCheck, Trash2, Smile, Reply } from 'lucide-react'
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
    <section className="flex h-full flex-col relative z-0">
      <header className="flex items-center justify-between px-[24px] h-[68px] bg-[rgba(19,22,31,0.8)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.06)] z-10">
        <div className="flex items-center gap-3">
          <div className="h-[42px] w-[42px] rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ background: gradient, boxShadow: isOnline ? '0 0 0 2px #13161f, 0 0 0 3px #22c55e' : 'none' }}>
            {letter}
          </div>
          <div>
            <div className="text-[15px] font-semibold text-white">{getRoomTitle(activeRoom, user._id)}</div>
            <div className="flex items-center gap-[6px]">
              {isOnline && <span className="h-[6px] w-[6px] rounded-full bg-[#22c55e] animate-online-pulse"></span>}
              <span className={`text-[12px] ${isOnline ? 'text-[#22c55e]' : 'text-[rgba(255,255,255,0.4)]'}`}>
                {isOnline ? 'Online' : (!isDirect ? `${activeRoom.members?.length || 0} members` : `Last seen ${activeRoom.lastSeen || 'recently'}`)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[8px]">
          {isSearching && (
            <input 
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat..."
              className="input-search px-3 rounded-xl h-[36px] w-48 text-sm text-white placeholder-[rgba(255,255,255,0.3)] transition-all"
            />
          )}
          <button onClick={() => { setIsSearching(!isSearching); setSearchQuery('') }} className={`w-[36px] h-[36px] rounded-[10px] flex items-center justify-center transition-all duration-150 ${isSearching ? 'bg-[rgba(255,255,255,0.15)] text-white scale-105' : 'text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] hover:scale-105'}`}>
            <Search size={20} />
          </button>
          {!activeRoom.isGroup && (
            <button onClick={() => callUser(partnerId)} className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-[rgba(255,255,255,0.4)] hover:text-[#6c63ff] hover:bg-[rgba(108,99,255,0.1)] hover:scale-105 transition-all duration-150">
              <Video size={20} />
            </button>
          )}
          <button onClick={() => alert('Options menu coming soon!')} className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.08)] hover:scale-105 transition-all duration-150">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin relative z-0">
        <div className="date-pill">Today</div>
        {displayMessages.map((message) => {
          const mine = message.sender?._id === user._id
          const readByOther = (message.readBy?.length > 0 && message.readBy.some(id => id !== user._id))
          
          return (
            <article key={message._id} className={`message-enter mb-4 max-w-[70%] group relative ${mine ? 'ml-auto' : 'mr-auto'}`}>
              <div className="flex items-end gap-2 relative">
                {mine && (
                  <button onClick={() => { if(window.confirm('Delete this message for everyone?')) deleteMessage(message._id) }} className="p-[6px] rounded-full text-[rgba(255,255,255,0.3)] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.15)] opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                )}
                
                <button onClick={() => setReplyingTo(message)} className={`p-[6px] rounded-full text-[rgba(255,255,255,0.3)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer ${mine ? 'order-first' : 'order-last'}`}>
                  <Reply size={16} />
                </button>
                
                <div className={`${mine ? 'msg-sender' : 'msg-receiver'} relative`}>
                  <div className="reaction-picker">
                    {EMOJIS.map(em => (
                      <button key={em} className="reaction-btn" onClick={() => reactToMessage(message._id, em)}>{em}</button>
                    ))}
                  </div>
                  
                  {!mine && activeRoom.isGroup && <div className="mb-[2px] text-[12px] font-semibold text-white/80">{message.sender?.name || message.sender?.username}</div>}
                  
                  {message.replyTo && (
                    <div className="mb-[6px] p-[6px_10px] rounded-[8px] bg-[rgba(0,0,0,0.15)] border-l-[3px] border-[#a78bfa] text-[13px] relative z-10 opacity-90">
                      <div className="font-semibold text-white/90 mb-[2px]">{message.replyTo.sender?.name || message.replyTo.sender?.username}</div>
                      <div className="text-[rgba(255,255,255,0.7)] truncate">{message.replyTo.content || (message.replyTo.imageUrl ? 'Photo' : 'Audio')}</div>
                    </div>
                  )}

                  {message.content && <div className="whitespace-pre-wrap relative z-10">{message.content}</div>}
                  {message.imageUrl && <img src={message.imageUrl} alt="attachment" className="mt-[8px] max-w-[260px] rounded-xl object-cover shadow-[0_4px_12px_rgba(0,0,0,0.3)] cursor-pointer hover:opacity-90 transition-opacity relative z-10" onClick={() => window.open(message.imageUrl, '_blank')} />}
                  
                  <div className="msg-timestamp relative z-10">
                    <span>{new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    {mine && (
                      <span className="ml-[2px]">
                        {readByOther ? <CheckCheck size={14} className="text-[#a78bfa]" /> : <Check size={14} />}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {(message.reactions || []).length > 0 && (
                <div className={`mt-[6px] flex gap-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                  {(message.reactions || []).map((r, i) => (
                    <div key={i} className="rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] px-[6px] py-[2px] text-[12px]">{r.emoji}</div>
                  ))}
                </div>
              )}
            </article>
          )
        })}

        {typingUser && (
          <div className="typing-bubble">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput />
    </section>
  )
}

export default ChatWindow
