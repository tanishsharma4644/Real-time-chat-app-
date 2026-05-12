import React from 'react'
import { createPortal } from 'react-dom'

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-[20px] bg-[rgba(30,33,48,0.95)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] p-[24px]">
        <div className="flex items-center justify-between mb-[20px]">
          <h3 className="text-[18px] font-semibold text-white tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>,
    document.body
  )
}

export default Modal
