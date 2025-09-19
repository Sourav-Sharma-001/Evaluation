import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./main.css"
import Dasboard from './Components/Dasboard'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Dasboard />
  </StrictMode>,
)
