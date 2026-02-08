import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProjectProvider } from './contexts/ProjectContext'
import { RefreshProvider } from './contexts/RefreshContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ProjectProvider>
        <RefreshProvider>
          <App />
        </RefreshProvider>
      </ProjectProvider>
    </ThemeProvider>
  </React.StrictMode>
)
