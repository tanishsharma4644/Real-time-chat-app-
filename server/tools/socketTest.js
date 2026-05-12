import { io } from 'socket.io-client'

const API = process.env.API_URL || 'http://localhost:5000'

async function main() {
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'demo@chat.com', password: 'demo123' }),
    })

    const j = await res.json()
    if (!j?.success) {
      console.error('Login failed:', j)
      process.exit(1)
    }

    const token = j.data.accessToken
    console.log('Obtained access token:', Boolean(token))

    const socket = io(API, { transports: ['websocket'] })

    socket.on('connect', () => {
      console.log('socket connected', socket.id)
      socket.emit('authenticate', { token })
    })

    socket.on('unauthorized', () => {
      console.error('Socket unauthorized')
      socket.disconnect()
      process.exit(1)
    })

    socket.on('online_users', (list) => {
      console.log('online_users:', list)
      socket.disconnect()
      process.exit(0)
    })

    socket.on('connect_error', (err) => {
      console.error('connect_error', err.message || err)
      process.exit(1)
    })

    setTimeout(() => {
      console.error('Test timed out')
      socket.disconnect()
      process.exit(1)
    }, 15000)
  } catch (err) {
    console.error('Test error', err)
    process.exit(1)
  }
}

main()
