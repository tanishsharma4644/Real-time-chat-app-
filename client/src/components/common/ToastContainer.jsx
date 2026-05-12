import React, { useEffect, useState } from 'react'

const Toast = ({ type='info', message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [])

  const border = type === 'success' ? 'border-l-4 border-green' : type === 'error' ? 'border-l-4 border-red' : 'border-l-4 border-accent'

  return (
    <div className={`toast-item ${border}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">{message}</div>
        <button onClick={onClose} className="text-text-secondary">✕</button>
      </div>
      <div className="h-1 mt-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-accent" style={{ width: '100%', transition: 'width 3s linear' }}></div>
      </div>
    </div>
  )
}

const ToastContainer = ({ toasts = [], removeToast }) => {
  return (
    <div className="toast">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  )
}

export default ToastContainer
