import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/v2.css'
import AppV2 from './App.v2.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppV2 />
  </StrictMode>,
)
