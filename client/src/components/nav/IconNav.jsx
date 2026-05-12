import React from 'react'
import { MessageSquare, Users, Search, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const IconButton = ({ active, title, icon: Icon, onClick }) => (
  <button 
    onClick={onClick}
    className={`nav-btn group relative flex items-center justify-center w-[44px] h-[44px] rounded-xl cursor-pointer transition-all duration-200 ${active ? 'bg-[rgba(108,99,255,0.2)] text-[#6c63ff]' : 'bg-transparent text-[rgba(255,255,255,0.35)] hover:text-white hover:bg-[rgba(108,99,255,0.15)] hover:scale-[1.08] active:scale-95'}`}
  >
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[24px] w-[3px] bg-[#6c63ff] rounded-r-[3px]"></div>}
    <Icon size={20} />
    <div className="tooltip-hover flex items-center">
      <div className="absolute -left-[4px] w-0 h-0 border-y-[4px] border-y-transparent border-r-[4px] border-r-[rgba(255,255,255,0.08)]"></div>
      {title}
    </div>
  </button>
)

const IconNav = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth()
  
  return (
    <nav className="flex h-full flex-col items-center gap-4 py-6 relative">
      <div className="w-full flex items-center justify-center mb-4">
        <div className="relative">
          <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-white font-semibold text-lg" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', boxShadow: '0 0 0 2px #0a0d14, 0 0 0 4px #22c55e' }}>
            {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="absolute right-0 bottom-0 h-[10px] w-[10px] rounded-full bg-[#22c55e] animate-online-pulse"></span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 w-full">
        <IconButton active={activeTab === 'chats'} onClick={() => setActiveTab('chats')} title="Chats" icon={MessageSquare} />
        <IconButton active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} title="Groups" icon={Users} />
        <IconButton active={activeTab === 'search'} onClick={() => setActiveTab('search')} title="Search" icon={Search} />
        <IconButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} title="Settings" icon={Settings} />
      </div>

      <div className="mt-auto w-full flex items-center justify-center pb-4">
        <button onClick={logout} className="nav-btn group relative flex items-center justify-center w-[44px] h-[44px] rounded-xl text-[rgba(255,255,255,0.35)] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.15)] hover:scale-[1.08] active:scale-95 transition-all duration-200">
          <LogOut size={20} />
          <div className="tooltip-hover flex items-center">
            <div className="absolute -left-[4px] w-0 h-0 border-y-[4px] border-y-transparent border-r-[4px] border-r-[rgba(255,255,255,0.08)]"></div>
            Logout
          </div>
        </button>
      </div>
    </nav>
  )
}

export default IconNav


