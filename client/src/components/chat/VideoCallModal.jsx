import React from 'react'
import { useCall } from '../../context/CallContext'
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff } from 'lucide-react'

const VideoCallModal = () => {
  const {
    stream,
    myVideo,
    userVideo,
    callAccepted,
    callEnded,
    callerName,
    receivingCall,
    isCalling,
    answerCall,
    endCall,
  } = useCall()

  const [micOn, setMicOn] = React.useState(true)
  const [videoOn, setVideoOn] = React.useState(true)

  React.useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream
    }
  }, [stream, isCalling, receivingCall, myVideo])

  const toggleMic = () => {
    if (myVideo.current && myVideo.current.srcObject) {
      myVideo.current.srcObject.getAudioTracks()[0].enabled = !micOn
      setMicOn(!micOn)
    }
  }

  const toggleVideo = () => {
    if (myVideo.current && myVideo.current.srcObject) {
      myVideo.current.srcObject.getVideoTracks()[0].enabled = !videoOn
      setVideoOn(!videoOn)
    }
  }

  // Determine if we should show the modal at all
  const showModal = receivingCall || isCalling

  if (!showModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center justify-center w-full max-w-4xl p-6 h-[80vh] rounded-3xl bg-surface border border-border shadow-2xl">
        
        {/* Header / Status */}
        <div className="absolute top-6 text-center z-10">
          <h2 className="text-2xl font-bold text-white">
            {receivingCall && !callAccepted ? `${callerName} is calling...` : isCalling && !callAccepted ? 'Calling...' : 'In Call'}
          </h2>
        </div>

        {/* Videos Container */}
        <div className="flex w-full h-full gap-4 mt-12 mb-20 relative">
          
          {/* Main User Video (The person you are calling) */}
          {callAccepted && !callEnded ? (
            <div className="w-full h-full rounded-2xl overflow-hidden bg-black flex-1 border border-border/50 relative shadow-soft-glow">
              <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-full rounded-2xl overflow-hidden bg-elevated flex items-center justify-center border border-border/50">
              <div className="h-24 w-24 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
                <Video size={40} className="text-accent" />
              </div>
            </div>
          )}

          {/* My Video (Picture in Picture or Side by side) */}
          {(isCalling || receivingCall) && (
            <div className={`overflow-hidden bg-black border border-border/50 shadow-lg transition-all duration-500 z-10
              ${callAccepted && !callEnded ? 'absolute bottom-4 right-4 w-48 h-64 rounded-xl' : 'w-full h-full flex-1 rounded-2xl'}`}>
              <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
            </div>
          )}

        </div>

        {/* Controls */}
        <div className="absolute bottom-6 flex items-center gap-6 px-8 py-4 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-xl">
          
          {callAccepted && !callEnded && (
            <>
              <button onClick={toggleMic} className={`p-4 rounded-full transition-colors ${micOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red/20 text-red hover:bg-red/30'}`}>
                {micOn ? <Mic size={24} /> : <MicOff size={24} />}
              </button>
              <button onClick={toggleVideo} className={`p-4 rounded-full transition-colors ${videoOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red/20 text-red hover:bg-red/30'}`}>
                {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
              </button>
            </>
          )}

          {receivingCall && !callAccepted && (
            <button onClick={answerCall} className="p-4 px-8 rounded-full bg-green text-white font-bold tracking-wide hover:bg-green/90 hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex items-center gap-2">
              <Phone size={24} /> Answer
            </button>
          )}

          {(isCalling || receivingCall) && (
            <button onClick={endCall} className="p-4 px-8 rounded-full bg-red text-white font-bold tracking-wide hover:bg-red/90 hover:scale-105 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex items-center gap-2">
              <PhoneOff size={24} /> {receivingCall && !callAccepted ? 'Decline' : 'End Call'}
            </button>
          )}

        </div>
      </div>
    </div>
  )
}

export default VideoCallModal
