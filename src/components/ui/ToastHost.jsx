import { useEffect, useState } from 'react'

const TOAST_EVENT = 'rugcircle:toast'
let toastId = 0

export default function ToastHost() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const onToast = (evt) => {
      const detail = evt?.detail || {}
      const id = ++toastId
      const toast = {
        id,
        type: detail.type === 'error' ? 'error' : 'success',
        message: String(detail.message || ''),
      }
      setToasts((items) => [...items, toast])
      window.setTimeout(() => {
        setToasts((items) => items.filter((item) => item.id !== id))
      }, 3200)
    }

    window.addEventListener(TOAST_EVENT, onToast)
    return () => window.removeEventListener(TOAST_EVENT, onToast)
  }, [])

  return (
    <div className="toast-host" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <span className="toast-dot" />
          <span className="toast-message">{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
