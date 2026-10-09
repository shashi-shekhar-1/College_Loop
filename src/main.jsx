
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ListingProvider } from './context/ListingContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ListingProvider>
        <App />
      </ListingProvider>
    </BrowserRouter>
  </StrictMode>,
)
