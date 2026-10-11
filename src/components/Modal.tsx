import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 50%, #e8edf4 100%)',
          border: '1px solid rgba(255,255,255,0.95)',
          boxShadow: '0 30px 60px -10px rgba(0,0,0,0.5), 0 18px 36px -18px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,1)',
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)',
            borderBottom: '2px solid #94a3b8',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}
        >
          <h3
            className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wide"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-200 font-black text-xl transition-all duration-100"
            style={{
              background: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)',
              border: '1px solid #94a3b8',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 3px rgba(0,0,0,0.15)',
            }}
            onMouseDown={(e) => {
              const el = e.currentTarget
              el.style.transform = 'translateY(1px)'
              el.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}
            onMouseUp={(e) => {
              const el = e.currentTarget
              el.style.transform = ''
              el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 3px rgba(0,0,0,0.15)'
            }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
