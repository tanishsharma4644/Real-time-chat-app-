import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import ChatWindow from './components/chat/ChatWindow'
import Sidebar from './components/chat/Sidebar'
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
    <main className="h-screen w-screen bg-[#0f1117] overflow-hidden">
      <section className="grid h-full w-full grid-cols-[340px_1fr]">
        <div className="h-full bg-[#0a0d14] border-r border-[rgba(255,255,255,0.05)] relative z-10 flex flex-col">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="h-full chat-bg flex flex-col relative z-0 min-h-0 overflow-hidden">
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

  return (
    <>
      {isAuthenticated ? <ChatShell /> : <AuthGate />}
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#13161f',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        },
      }} />
    </>
  )
}

export default App
