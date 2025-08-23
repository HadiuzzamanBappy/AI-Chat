/**
 * Application Entry Point
 * 
 * Root entry file that initializes the React application with StrictMode
 * for enhanced development debugging and mounts the App component to the DOM.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize React root and render application with StrictMode for development safety
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
