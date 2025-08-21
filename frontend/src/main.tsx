import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'


if (import.meta.env.MODE === 'dev') {
  const react_dev_tools = document.createElement('script');
  react_dev_tools.src = "http://localhost:8097";

  document.head.append(react_dev_tools)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
