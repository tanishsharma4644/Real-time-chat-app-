import React, { useState, useMemo } from 'react'
import Modal from '../common/Modal'

const NewChatModal = ({ open, onClose, users, currentUserId, onStartDirectChat, onCreateGroupChat }) => {
  const [tab, setTab] = useState('direct') // 'direct' or 'group'
  const [groupName, setGroupName] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [search, setSearch] = useState('')

  const availableUsers = useMemo(() => {
    return users.filter(u => u._id !== currentUserId && (u.name || u.username).toLowerCase().includes(search.toLowerCase()))
  }, [users, currentUserId, search])

  const handleStartDirect = (userId) => {
    onStartDirectChat(userId)
    onClose()
  }

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedIds.length === 0) return
    onCreateGroupChat(groupName, selectedIds)
    setGroupName('')
    setSelectedIds([])
    onClose()
  }

  const toggleUserSelection = (userId) => {
    setSelectedIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="New Conversation">
      <div className="mb-5 flex gap-2 border-b border-[rgba(255,255,255,0.06)] pb-2">
        <button 
          onClick={() => setTab('direct')}
          className={`px-4 py-2 text-[14px] font-medium transition-all ${tab === 'direct' ? 'border-b-[2px] border-[#6c63ff] text-[#6c63ff]' : 'text-[rgba(255,255,255,0.4)] hover:text-white'}`}
        >
          Direct Chat
        </button>
        <button 
          onClick={() => setTab('group')}
          className={`px-4 py-2 text-[14px] font-medium transition-all ${tab === 'group' ? 'border-b-[2px] border-[#6c63ff] text-[#6c63ff]' : 'text-[rgba(255,255,255,0.4)] hover:text-white'}`}
        >
          Group Chat
        </button>
      </div>

      <div className="mb-4 relative">
        <input 
          type="text" 
          placeholder="Search users..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-search w-full h-[42px] px-4 rounded-[12px] text-[14px] text-white placeholder-[rgba(255,255,255,0.3)] transition-all"
        />
      </div>

      {tab === 'group' && (
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Group Name" 
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="input-search w-full h-[42px] px-4 rounded-[12px] text-[14px] text-white placeholder-[rgba(255,255,255,0.3)] transition-all"
          />
        </div>
      )}

      <div className="max-h-[240px] overflow-y-auto space-y-[4px] pr-2 mb-4 scrollbar-thin">
        {availableUsers.length === 0 ? (
          <p className="text-[14px] text-[rgba(255,255,255,0.4)] text-center py-4">No users found.</p>
        ) : (
          availableUsers.map(u => (
            <div 
              key={u._id} 
              onClick={() => tab === 'direct' ? handleStartDirect(u._id) : toggleUserSelection(u._id)}
              className="flex items-center gap-[12px] p-[10px_12px] hover:bg-[rgba(255,255,255,0.06)] rounded-[12px] cursor-pointer transition-colors"
            >
              <div className="h-[40px] w-[40px] rounded-full flex items-center justify-center text-white text-[14px] font-semibold" style={{ background: 'linear-gradient(135deg, #6c63ff, #8b85ff)' }}>
                {(u.name || u.username || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-medium text-white">{u.name || u.username}</p>
              </div>
              {tab === 'group' && (
                <div className={`h-[20px] w-[20px] rounded-[6px] border flex items-center justify-center transition-colors ${selectedIds.includes(u._id) ? 'bg-[#6c63ff] border-[#6c63ff]' : 'border-[rgba(255,255,255,0.2)]'}`}>
                  {selectedIds.includes(u._id) && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {tab === 'group' && (
        <button 
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || selectedIds.length === 0}
          className="w-full h-[46px] rounded-[14px] font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #8b85ff)' }}
        >
          Create Group ({selectedIds.length})
        </button>
      )}
    </Modal>
  )
}

export default NewChatModal
