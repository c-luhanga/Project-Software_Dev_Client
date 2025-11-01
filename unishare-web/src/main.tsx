import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Providers } from './app/Providers'
import { AppInitializer } from './app/AppInitializer'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <AppInitializer>
        <App />
      </AppInitializer>
    </Providers>
  </StrictMode>,
)
