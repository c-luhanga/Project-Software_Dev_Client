import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Providers } from './app/Providers'
import App from './App.tsx'
import { rehydrateTokenOnLoad } from './utils/tokenStorage'

// Initialize token storage from sessionStorage before app starts
rehydrateTokenOnLoad();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
