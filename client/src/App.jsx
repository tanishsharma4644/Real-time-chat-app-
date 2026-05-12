import { useState } from 'react'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import ChatWindow from './components/chat/ChatWindow'
import Sidebar from './components/chat/Sidebar'
import IconNav from './components/nav/IconNav'
import VideoCallModal from './components/chat/VideoCallModal'
import { useAuth } from './context/AuthContext'
import { useChat } from './context/ChatContext'

const AuthGate = () => {
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')

  return (
    <section className="relative grid min-h-screen place-items-center bg-[#0f1117] p-6 overflow-hidden">
      <div className="auth-orb-1"></div>
      <div className="auth-orb-2"></div>
      
      <div className="relative z-10 auth-card">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-bold tracking-tight mb-2" style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Realtime Chat
          </h1>
          <p className="text-[14px] text-white/40">Welcome back! Please login to continue.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-border bg-elevated/60 px-3 py-2 text-sm text-red">
            {error}
          </div>
        )}

        <div>
          {mode === 'login' ? (
            <LoginForm onSwitch={() => setMode('register')} onError={setError} />
          ) : (
            <RegisterForm onSwitch={() => setMode('login')} onError={setError} />
          )}
        </div>
      </div>
    </section>
  )
}

const ChatShell = () => {
  const { loading } = useChat()
  const [activeTab, setActiveTab] = useState('chats')

  if (loading) {
    return (
      <section className="grid min-h-screen place-items-center bg-base">
        <p className="animate-pulse text-text-secondary">Preparing your workspace...</p>
      </section>
    )
  }

  return (
    <main className="min-h-screen p-4 bg-[#0f1117]">
      <section className="mx-auto grid h-[calc(100vh-2rem)] max-w-[1400px] grid-cols-[72px_280px_1fr] rounded-2xl overflow-hidden panel-border">
        <div className="h-full bg-[#0a0d14] border-r border-[rgba(255,255,255,0.05)] relative z-20">
          <IconNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="h-full bg-[#13161f] border-r border-[rgba(108,99,255,0.15)] relative z-10">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="h-full chat-bg flex flex-col relative z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none"></div>
          <ChatWindow />
        </div>
        <VideoCallModal />
      </section>
    </main>
  )
}

function App() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <section className="grid min-h-screen place-items-center bg-base">
        <p className="animate-pulse text-text-secondary">Loading session...</p>
      </section>
    )
  }

  return isAuthenticated ? <ChatShell /> : <AuthGate />
}

export default App
