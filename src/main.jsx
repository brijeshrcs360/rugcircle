import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AdminSessionProvider } from './context/AdminSessionContext'
import { UserSessionProvider } from './context/UserSessionContext'
import ToastHost from './components/ui/ToastHost'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminSessionProvider>
      <UserSessionProvider>
      <BrowserRouter>
        <App />
        <ToastHost />
      </BrowserRouter>
          </UserSessionProvider>
    </AdminSessionProvider>
  </StrictMode>,
)
