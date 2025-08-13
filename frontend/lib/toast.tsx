"use client"
import { useEffect, useState } from 'react'

export type Toast = { id: string; message: string; kind?: 'info' | 'success' | 'error' }

const listeners = new Set<(t: Toast) => void>()

export const toast = (message: string, kind: Toast['kind'] = 'info') => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const t: Toast = { id, message, kind }
  listeners.forEach((fn) => fn(t))
}

export function ToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const onToast = (t: Toast) => {
      setToasts((prev) => [...prev, t])
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id))
      }, 2500)
    }
    listeners.add(onToast)
    return () => {
      listeners.delete(onToast)
    }
  }, [])

  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-4 right-4 z-[2000] space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className={`px-3 py-2 text-xs trk-mid border ${t.kind === 'error' ? 'bg-red-600 text-white' : t.kind === 'success' ? 'bg-black text-white' : 'bg-white text-black'}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}