import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import Peer from 'simple-peer'
import { useSocket } from './SocketContext'
import { useAuth } from './AuthContext'

const CallContext = createContext(null)

export const CallProvider = ({ children }) => {
  const { socket } = useSocket()
  const { user } = useAuth()

  const [stream, setStream] = useState(null)
  const [receivingCall, setReceivingCall] = useState(false)
  const [caller, setCaller] = useState('')
  const [callerName, setCallerName] = useState('')
  const [callerSignal, setCallerSignal] = useState(null)
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [isCalling, setIsCalling] = useState(false)

  const myVideo = useRef(null)
  const userVideo = useRef(null)
  const connectionRef = useRef(null)

  useEffect(() => {
    if (!socket) return

    const onCallIncoming = ({ from, name, signal }) => {
      setReceivingCall(true)
      setCaller(from)
      setCallerName(name)
      setCallerSignal(signal)
    }

    const onCallEnded = () => {
      endCall()
    }

    socket.on('call_incoming', onCallIncoming)
    socket.on('call_ended', onCallEnded)

    return () => {
      socket.off('call_incoming', onCallIncoming)
      socket.off('call_ended', onCallEnded)
    }
  }, [socket])

  const setupMediaStream = async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setStream(currentStream)
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream
      }
      return currentStream
    } catch (err) {
      console.error('Failed to get media stream', err)
      return null
    }
  }

  const callUser = async (idToCall) => {
    if (!idToCall) {
      console.error('No user ID to call!')
      return
    }

    const currentStream = await setupMediaStream()
    if (!currentStream) return

    setIsCalling(true)
    const peer = new Peer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      },
      stream: currentStream,
    })

    peer.on('signal', (data) => {
      console.log('Generated caller signal, emitting to server...', idToCall)
      socket.emit('call_user', {
        userToCall: idToCall,
        signalData: data,
        from: user?._id,
        name: user?.name || user?.username,
      })
    })

    peer.on('stream', (userStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = userStream
      }
    })

    socket.on('call_accepted', (signal) => {
      setCallAccepted(true)
      peer.signal(signal)
    })

    connectionRef.current = peer
  }

  const answerCall = async () => {
    setCallAccepted(true)
    const currentStream = await setupMediaStream()
    if (!currentStream) return

    const peer = new Peer({
      initiator: false,
      trickle: false,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      },
      stream: currentStream,
    })

    peer.on('signal', (data) => {
      console.log('Generated answer signal, emitting to server...')
      socket.emit('answer_call', { signal: data, to: caller })
    })

    peer.on('stream', (userStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = userStream
      }
    })

    peer.signal(callerSignal)
    connectionRef.current = peer
  }

  const endCall = () => {
    setCallEnded(true)
    setReceivingCall(false)
    setIsCalling(false)
    setCallAccepted(false)
    
    if (connectionRef.current) {
      connectionRef.current.destroy()
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    if (socket && caller) {
      socket.emit('end_call', { to: caller })
    }
  }

  return (
    <CallContext.Provider
      value={{
        stream,
        myVideo,
        userVideo,
        callAccepted,
        callEnded,
        caller,
        callerName,
        receivingCall,
        isCalling,
        callUser,
        answerCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  )
}

export const useCall = () => {
  const context = useContext(CallContext)
  if (!context) {
    throw new Error('useCall must be used within CallProvider')
  }
  return context
}
