import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/tokens.css'
import '../styles/shared.css'
import '../styles/child.css'
import ChildApp from './ChildApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChildApp />
  </StrictMode>,
)
