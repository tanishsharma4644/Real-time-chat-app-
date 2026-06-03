import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, MessageSquare, Users, Compass, Settings, Plus, Search } from 'lucide-react'
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

  return (
    <aside className="flex h-full flex-col bg-[#0a0d14] relative z-10 w-[340px]">
      {/* Top Header / Logo */}
      <div className="p-5 flex items-center justify-between">
        <h1 className="text-[22px] font-black tracking-tight" style={{ background: 'linear-gradient(90deg, #6c63ff, #00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          NexTalk
        </h1>
        <button onClick={() => setIsModalOpen(true)} className="w-[36px] h-[36px] rounded-[12px] flex items-center justify-center border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all active:scale-95 hover:rotate-90">
          <Plus size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="relative group">
          <input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 rounded-[12px] h-[42px] text-[14px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(108,99,255,0.5)] focus:bg-[rgba(255,255,255,0.06)] transition-all"
          />
          <div className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.3)] group-focus-within:text-[#6c63ff] transition-colors">
            <Search size={16} />
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="px-3 mb-6 flex flex-col gap-1">
        <button className={`w-full flex items-center justify-between px-3 py-[10px] rounded-[12px] transition-all group ${activeTab === 'chats' ? 'bg-[rgba(108,99,255,0.15)]' : 'hover:bg-[rgba(255,255,255,0.03)] hover:translate-x-1'}`} onClick={() => setActiveTab('chats')}>
          <div className="flex items-center gap-3">
            <MessageSquare size={18} className={`${activeTab === 'chats' ? 'text-[#8b85ff]' : 'text-[rgba(255,255,255,0.4)] group-hover:text-[rgba(255,255,255,0.8)]'} transition-colors`} />
            <span className={`text-[14px] font-medium ${activeTab === 'chats' ? 'text-[#8b85ff]' : 'text-[rgba(255,255,255,0.5)] group-hover:text-[rgba(255,255,255,0.8)]'} transition-colors`}>Messages</span>
          </div>
          {rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0) > 0 && (
            <div className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-br from-[#6c63ff] to-[#8b85ff] shadow-[0_0_10px_rgba(108,99,255,0.5)]">
              {rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0)}
            </div>
          )}
        </button>
        <button className={`w-full flex items-center justify-between px-3 py-[10px] rounded-[12px] transition-all group ${activeTab === 'groups' ? 'bg-[rgba(108,99,255,0.15)]' : 'hover:bg-[rgba(255,255,255,0.03)] hover:translate-x-1'}`} onClick={() => setActiveTab('groups')}>
          <div className="flex items-center gap-3">
            <Users size={18} className={`${activeTab === 'groups' ? 'text-[#8b85ff]' : 'text-[rgba(255,255,255,0.4)] group-hover:text-[rgba(255,255,255,0.8)]'} transition-colors`} />
            <span className={`text-[14px] font-medium ${activeTab === 'groups' ? 'text-[#8b85ff]' : 'text-[rgba(255,255,255,0.5)] group-hover:text-[rgba(255,255,255,0.8)]'} transition-colors`}>Groups</span>
          </div>
        </button>
        <button className={`w-full flex items-center justify-between px-3 py-[10px] rounded-[12px] transition-all group hover:bg-[rgba(255,255,255,0.03)] hover:translate-x-1`} onClick={() => {}}>
          <div className="flex items-center gap-3">
            <Compass size={18} className="text-[rgba(255,255,255,0.4)] group-hover:text-[rgba(255,255,255,0.8)] transition-colors" />
            <span className="text-[14px] font-medium text-[rgba(255,255,255,0.5)] group-hover:text-[rgba(255,255,255,0.8)] transition-colors">Explore</span>
          </div>
        </button>
        <button className={`w-full flex items-center justify-between px-3 py-[10px] rounded-[12px] transition-all group ${activeTab === 'settings' ? 'bg-[rgba(108,99,255,0.15)]' : 'hover:bg-[rgba(255,255,255,0.03)] hover:translate-x-1'}`} onClick={() => setActiveTab('settings')}>
          <div className="flex items-center gap-3">
            <Settings size={18} className={`${activeTab === 'settings' ? 'text-[#8b85ff]' : 'text-[rgba(255,255,255,0.4)] group-hover:text-[rgba(255,255,255,0.8)]'} transition-colors`} />
            <span className={`text-[14px] font-medium ${activeTab === 'settings' ? 'text-[#8b85ff]' : 'text-[rgba(255,255,255,0.5)] group-hover:text-[rgba(255,255,255,0.8)]'} transition-colors`}>Settings</span>
          </div>
        </button>
      </div>

      <div className="px-5 mb-2">
        <h3 className="text-[11px] font-bold tracking-[0.1em] text-[rgba(255,255,255,0.3)]">RECENT</h3>
      </div>

      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {filteredRooms.length === 0 ? (
          <div className="text-center text-sm text-[rgba(255,255,255,0.4)] py-4">No conversations found</div>
        ) : (
          filteredRooms.map((room, index) => {
            const letter = (room.name || roomTitle(room, user._id) || 'G').slice(0,1).toUpperCase()
            let gradient = 'linear-gradient(135deg, #667eea, #764ba2)'
            if (/[G-L]/.test(letter)) gradient = 'linear-gradient(135deg, #11998e, #38ef7d)'
            else if (/[M-R]/.test(letter)) gradient = 'linear-gradient(135deg, #f093fb, #f5576c)'
            else if (/[S-Z]/.test(letter)) gradient = 'linear-gradient(135deg, #f7971e, #ffd200)'

            const isActive = activeRoomId === room._id
            const isOnline = onlineSet.has(room._id)

            return (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                key={room._id}
                onClick={() => setActiveRoomId(room._id)}
                className={`w-[calc(100%-16px)] mx-[8px] my-[4px] flex items-center gap-[12px] rounded-[16px] p-[12px_16px] transition-all duration-200 group ${
                  isActive ? 'bg-[rgba(108,99,255,0.08)] border border-[rgba(108,99,255,0.2)]' : 'hover:bg-[rgba(255,255,255,0.02)] border border-transparent hover:translate-x-[2px]'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="h-[46px] w-[46px] rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{ background: gradient }}>{letter}</div>
                  {isOnline && <span className="absolute -right-1 -bottom-1 h-[14px] w-[14px] rounded-full bg-transparent animate-online-pulse border-[3px] border-[#0a0d14]" style={{ background: '#22c55e' }}></span>}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-[2px]">
                    <div className="text-[14px] font-medium text-[#f0f0f0] truncate">{roomTitle(room, user._id)}</div>
                    <div className="text-[11px] text-[rgba(255,255,255,0.3)] whitespace-nowrap ml-2">{room.lastMessage ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</div>
                  </div>
                  <div className="flex items-center justify-between mt-[2px]">
                    {room.lastMessage?.content && (
                      <div className="text-[13px] text-[rgba(255,255,255,0.4)] whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px] pr-2">
                        {(room.lastMessage.sender?._id === user._id || room.lastMessage.sender === user._id) ? 'You: ' : ''}
                        {room.lastMessage.content}
                      </div>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                      {room.unreadCount > 0 && (
                        <motion.div 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-[10px] text-[11px] font-semibold text-white shadow-[0_0_12px_#6c63ff] animate-badgePulse" style={{ background: 'linear-gradient(135deg, #6c63ff, #8b85ff)' }}>
                          {room.unreadCount}
                        </motion.div>
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
              </motion.button>
            )
          })
        )}
      </div>

      <div className="mt-auto p-4 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-[40px] h-[40px] rounded-2xl bg-gradient-to-br from-[#f093fb] to-[#f5576c] flex items-center justify-center text-[15px] font-bold text-white shadow-[0_4px_10px_rgba(240,147,251,0.3)]">
                {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-white">{user.name || user.username}</div>
                <div className="text-[12px] text-[#22c55e] flex items-center gap-1.5 font-medium">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#22c55e] animate-pulse"></span> Active
                </div>
              </div>
           </div>
           <button onClick={() => setActiveTab('settings')} className="text-[rgba(255,255,255,0.3)] hover:text-[#6c63ff] transition-all hover:rotate-90">
             <Settings size={20} />
           </button>
        </div>
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
