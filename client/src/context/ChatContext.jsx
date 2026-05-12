import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../utils/api'
import { useAuth } from './AuthContext'
import { useSocket } from './SocketContext'

const ChatContext = createContext(null)

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const { socket } = useSocket()

  const [rooms, setRooms] = useState([])
  const [users, setUsers] = useState([])
  const [messagesByRoom, setMessagesByRoom] = useState({})
  const [activeRoomId, setActiveRoomId] = useState('')
  const [onlineUsers, setOnlineUsers] = useState({})
  const [typingByRoom, setTypingByRoom] = useState({})
  const [loading, setLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)

  const activeRoom = rooms.find((room) => room._id === activeRoomId) || null

  const setMessagesForRoom = (roomId, updater) => {
    setMessagesByRoom((previous) => {
      const previousMessages = previous[roomId] || []
      const nextMessages = typeof updater === 'function' ? updater(previousMessages) : updater

      return {
        ...previous,
        [roomId]: nextMessages,
      }
    })
  }

  const refreshRooms = async () => {
    const { data } = await api.get('/chat')
    setRooms(data.data || [])
    return data.data
  }

  const refreshUsers = async () => {
    const { data } = await api.get('/users')
    setUsers(data.data || [])
    return data.data
  }

  const fetchRoomMessages = async (roomId, search = '') => {
    const { data } = await api.get(`/messages/${roomId}`, {
      params: { q: search },
    })

    setMessagesForRoom(roomId, data.data.messages || [])
    return data.data
  }

  const bootstrapChat = async () => {
    if (!isAuthenticated) {
      return
    }

    setLoading(true)

    try {
      const [nextRooms] = await Promise.all([refreshRooms(), refreshUsers()])

      if (nextRooms.length > 0) {
        setActiveRoomId(nextRooms[0]._id)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    bootstrapChat()
  }, [isAuthenticated])

  useEffect(() => {
    if (!activeRoomId) {
      return
    }

    fetchRoomMessages(activeRoomId)
    
    // Clear unread count when opening a room
    setRooms(prevRooms => prevRooms.map(r => r._id === activeRoomId ? { ...r, unreadCount: 0 } : r))
  }, [activeRoomId])

  useEffect(() => {
    if (!socket || !activeRoomId) {
      return
    }

    socket.emit('join_chat', activeRoomId)

    const onReconnect = () => {
      // Small delay to ensure authenticate has run first in SocketContext
      setTimeout(() => {
        socket.emit('join_chat', activeRoomId)
      }, 500)
    }
    
    socket.on('connect', onReconnect)

    return () => {
      socket.emit('leave_chat', activeRoomId)
      socket.off('connect', onReconnect)
    }
  }, [socket, activeRoomId])

  useEffect(() => {
    if (!socket) {
      return
    }

    const onReceiveMessage = (message) => {
      setMessagesForRoom(message.chat, (previous) => [...previous, message])
      
      setRooms(prevRooms => {
        let exists = false
        const updated = prevRooms.map(r => {
          if (r._id === message.chat) {
            exists = true
            const isUnread = message.chat !== activeRoomId
            return {
              ...r,
              lastMessage: message,
              unreadCount: isUnread ? (r.unreadCount || 0) + 1 : 0
            }
          }
          return r
        })
        if (!exists) {
          // New room entirely, fetch rooms to update sidebar
          refreshRooms()
          return prevRooms
        }
        return updated
      })
    }

    const onTypingStart = ({ chatId, user: typingUser }) => {
      if (typingUser._id === user?._id) return
      setTypingByRoom((previous) => ({ ...previous, [chatId]: typingUser._id }))
    }

    const onTypingEnd = ({ chatId }) => {
      setTypingByRoom((previous) => {
        const next = { ...previous }
        delete next[chatId]
        return next
      })
    }

    const onReactionUpdated = (updatedMessage) => {
      setMessagesForRoom(updatedMessage.chat, (previous) =>
        previous.map((message) =>
          message._id === updatedMessage._id ? updatedMessage : message
        )
      )
    }

    const onReadReceipt = ({ messageId, userId }) => {
      setMessagesForRoom(activeRoomId, (previous) =>
        previous.map((message) => {
          if (message._id !== messageId) return message
          
          const alreadyRead = (message.readBy || []).some((reader) => {
            const readerId = typeof reader === 'string' ? reader : reader._id
            return readerId === userId
          })

          if (alreadyRead) return message

          return { ...message, readBy: [...(message.readBy || []), userId] }
        })
      )
    }

    const onOnlineUsers = (userIds) => {
      const nextOnline = {}
      userIds.forEach(id => { nextOnline[id] = 'online' })
      setOnlineUsers(nextOnline)
    }

    const onMessageDeleted = ({ messageId, chatId }) => {
      setMessagesForRoom(chatId, (previous) => previous.filter((msg) => msg._id !== messageId))
      refreshRooms() // To update last message in sidebar
    }

    socket.on('receive_message', onReceiveMessage)
    socket.on('typing_start', onTypingStart)
    socket.on('typing_end', onTypingEnd)
    socket.on('reaction_updated', onReactionUpdated)
    socket.on('read_receipt', onReadReceipt)
    socket.on('online_users', onOnlineUsers)
    socket.on('message_deleted', onMessageDeleted)

    return () => {
      socket.off('receive_message', onReceiveMessage)
      socket.off('typing_start', onTypingStart)
      socket.off('typing_end', onTypingEnd)
      socket.off('reaction_updated', onReactionUpdated)
      socket.off('read_receipt', onReadReceipt)
      socket.off('online_users', onOnlineUsers)
      socket.off('message_deleted', onMessageDeleted)
    }
  }, [socket, user?._id])

  const startDirectChat = async (partnerId) => {
    const { data } = await api.post('/chat', { userId: partnerId })
    const newRoom = data.data
    setRooms((previous) => {
      const exists = previous.some((room) => room._id === newRoom._id)
      if (exists) {
        return previous
      }
      return [newRoom, ...previous]
    })
    setActiveRoomId(newRoom._id)
  }

  const createGroupChat = async (name, participantIds) => {
    const { data } = await api.post('/chat/group', { name, members: participantIds })
    const newRoom = data.data
    setRooms((previous) => [newRoom, ...previous])
    setActiveRoomId(newRoom._id)
  }

  const sendMessage = ({ content, imageUrl = '', audioUrl = '' }) => {
    if (!socket || !activeRoomId) {
      return
    }

    socket.emit('send_message', {
      chatId: activeRoomId,
      content,
      imageUrl,
      audioUrl,
      replyTo: replyingTo?._id || undefined,
    })
    
    setReplyingTo(null)
  }

  const setTyping = (isTyping) => {
    if (!socket || !activeRoomId) {
      return
    }

    socket.emit(isTyping ? 'typing_start' : 'typing_end', { chatId: activeRoomId })
  }

  const markAsRead = async (messageId) => {
    if (!activeRoomId || !messageId) {
      return
    }

    if (socket) {
      socket.emit('message_read', { chatId: activeRoomId, messageId })
    }
  }

  const reactToMessage = async (messageId, emoji) => {
    if (!activeRoomId) {
      return
    }

    await api.post(`/messages/${messageId}/reaction`, { emoji })

    if (socket) {
      socket.emit('reaction', {
        roomId: activeRoomId,
        messageId,
        emoji,
      })
    }
  }

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return data.data.url
  }

  const deleteMessage = async (messageId) => {
    if (!activeRoomId || !messageId) return
    try {
      await api.delete(`/messages/${messageId}`)
      if (socket) {
        socket.emit('delete_message', { chatId: activeRoomId, messageId })
      }
    } catch (err) {
      console.error('Failed to delete message', err)
      alert('Could not delete message.')
    }
  }

  const deleteChat = async (chatId) => {
    if (!chatId) return
    try {
      await api.delete(`/chat/${chatId}`)
      setRooms(prev => prev.filter(r => r._id !== chatId))
      if (activeRoomId === chatId) setActiveRoomId('')
    } catch (err) {
      console.error('Failed to delete chat', err)
      alert('Could not delete chat.')
    }
  }

  const value = useMemo(
    () => ({
      loading,
      rooms,
      users,
      activeRoom,
      activeRoomId,
      setActiveRoomId,
      messages: messagesByRoom[activeRoomId] || [],
      onlineUsers,
      typingUserId: typingByRoom[activeRoomId] || '',
      replyingTo,
      setReplyingTo,
      startDirectChat,
      createGroupChat,
      sendMessage,
      setTyping,
      markAsRead,
      reactToMessage,
      deleteMessage,
      deleteChat,
      uploadImage,
      fetchRoomMessages,
    }),
    [
      loading,
      rooms,
      users,
      activeRoom,
      activeRoomId,
      messagesByRoom,
      onlineUsers,
      typingByRoom,
      replyingTo,
    ]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => {
  const context = useContext(ChatContext)

  if (!context) {
    throw new Error('useChat must be used inside ChatProvider')
  }

  return context
}
