import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import NewChatModal from './NewChatModal'

const roomTitle = (room, currentUserId) => {
  if (room.isGroup) {
    return room.name || 'Unnamed Group'
  }

  const partner = room.members?.find((member) => member._id !== currentUserId)
  return partner?.name || partner?.username || 'Direct Chat'
}

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth()
  const {
    rooms,
    users,
    activeRoomId,
    setActiveRoomId,
    onlineUsers,
    startDirectChat,
    createGroupChat,
    deleteChat,
  } = useChat()

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const onlineSet = useMemo(
    () => new Set(Object.entries(onlineUsers).filter(([, status]) => status === 'online').map(([id]) => id)),
    [onlineUsers]
  )

  const filteredRooms = useMemo(() => {
    let filtered = rooms
    if (activeTab === 'groups') {
      filtered = filtered.filter(r => r.isGroup)
    } else if (activeTab === 'chats') {
      filtered = filtered.filter(r => !r.isGroup)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((room) => {
        const title = roomTitle(room, user._id).toLowerCase()
        return title.includes(query)
      })
    }
    
    return filtered.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0
      const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0
      return timeB - timeA
    })
  }, [rooms, searchQuery, user._id, activeTab])

  if (activeTab === 'settings') {
    return (
      <aside className="flex h-full flex-col bg-surface/40 backdrop-blur-md relative z-10">
        <div className="p-5 border-b border-[rgba(255,255,255,0.06)]">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-white">Settings</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-[16px] p-6 text-center">
            <div className="mx-auto w-[80px] h-[80px] rounded-full flex items-center justify-center text-white text-[32px] font-bold mb-4" style={{ background: 'linear-gradient(135deg, #6c63ff, #8b85ff)', boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}>
              {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <h3 className="text-[18px] font-semibold text-white">{user.name || user.username}</h3>
            <p className="text-[14px] text-[rgba(255,255,255,0.5)] mt-1">{user.email}</p>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="p-4 bg-[rgba(255,255,255,0.02)] rounded-[12px] border border-[rgba(255,255,255,0.04)]">
              <h4 className="text-[14px] font-medium text-[rgba(255,255,255,0.8)] mb-1">Theme</h4>
              <p className="text-[13px] text-[rgba(255,255,255,0.4)]">Dark Premium (Active)</p>
            </div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="flex h-full flex-col bg-surface/40 backdrop-blur-md relative z-10">
      <div className="p-5 border-b border-border/40">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-white">
            {activeTab === 'groups' ? 'Groups' : activeTab === 'search' ? 'Search' : 'Messages'}
          </h2>
          <button className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[rgba(255,255,255,0.4)] hover:text-[#6c63ff] hover:bg-[rgba(108,99,255,0.1)] transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
        </div>

        <div className="relative">
          <input
            autoFocus={activeTab === 'search'}
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-search w-full pl-10 pr-4 rounded-[12px] h-[40px] text-[14px] text-white placeholder-[rgba(255,255,255,0.25)]"
          />
          <div className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.3)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {filteredRooms.length === 0 ? (
          <div className="text-center text-sm text-[rgba(255,255,255,0.4)] py-4">No conversations found</div>
        ) : (
          filteredRooms.map((room) => {
            const letter = (room.name || roomTitle(room, user._id) || 'G').slice(0,1).toUpperCase()
            let gradient = 'linear-gradient(135deg, #667eea, #764ba2)'
            if (/[G-L]/.test(letter)) gradient = 'linear-gradient(135deg, #11998e, #38ef7d)'
            else if (/[M-R]/.test(letter)) gradient = 'linear-gradient(135deg, #f093fb, #f5576c)'
            else if (/[S-Z]/.test(letter)) gradient = 'linear-gradient(135deg, #f7971e, #ffd200)'

            const isActive = activeRoomId === room._id
            const isOnline = onlineSet.has(room._id)

            return (
              <button
                key={room._id}
                onClick={() => setActiveRoomId(room._id)}
                className={`w-[calc(100%-16px)] mx-[8px] my-[4px] flex items-center gap-[12px] rounded-[14px] p-[12px_16px] transition-all duration-150 group ${
                  isActive ? 'bg-[rgba(108,99,255,0.12)] border-l-[3px] border-l-[#6c63ff]' : 'hover:bg-[rgba(255,255,255,0.04)] hover:translate-x-[2px]'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="h-[46px] w-[46px] rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ background: gradient }}>{letter}</div>
                  {isOnline && <span className="absolute -right-0 -bottom-0 h-[12px] w-[12px] rounded-full bg-transparent animate-online-pulse border-[2px] border-[#13161f]" style={{ background: '#22c55e' }}></span>}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-[2px]">
                    <div className="text-[14px] font-medium text-[#f0f0f0] truncate">{roomTitle(room, user._id)}</div>
                    <div className="text-[11px] text-[rgba(255,255,255,0.3)] whitespace-nowrap ml-2">{room.lastMessage ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</div>
                  </div>
                  <div className="flex items-center justify-between mt-[2px]">
                    {room.lastMessage?.content && <div className="text-[13px] text-[rgba(255,255,255,0.4)] whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px] pr-2">{room.lastMessage.content}</div>}
                    <div className="flex items-center gap-1 shrink-0">
                      {room.unreadCount > 0 && (
                        <div className="inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-[10px] text-[11px] font-semibold text-white shadow-[0_2px_8px_rgba(108,99,255,0.5)] animate-badgePulse" style={{ background: 'linear-gradient(135deg, #6c63ff, #8b85ff)' }}>
                          {room.unreadCount}
                        </div>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm('Delete this entire chat?')) deleteChat(room._id)
                        }} 
                        className="p-1 rounded-full text-[rgba(255,255,255,0.4)] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      <div className="p-[16px] bg-transparent">
        <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center gap-[8px] rounded-[14px] h-[46px] text-[14px] font-semibold text-white transition-all duration-200 active:scale-[0.98] hover:-translate-y-[2px]" style={{ background: 'linear-gradient(135deg, #6c63ff, #8b85ff)', boxShadow: '0 4px 15px rgba(108,99,255,0.4)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          New Chat
        </button>
      </div>

      <NewChatModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
        currentUserId={user._id}
        onStartDirectChat={startDirectChat}
        onCreateGroupChat={createGroupChat}
      />
    </aside>
  )
}

export default Sidebar
