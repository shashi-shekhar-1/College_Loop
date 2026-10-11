import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ListingProvider } from './context/ListingContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ListingProvider>
          <App />
        </ListingProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)