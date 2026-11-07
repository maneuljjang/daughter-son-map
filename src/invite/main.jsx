import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/tokens.css'
import '../styles/shared.css'
import '../styles/invite.css'
import InviteApp from './InviteApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <InviteApp />
  </StrictMode>,
)
