import React, { useState } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom'
import Upload from './pages/Upload'
import UnifiedUpload from './pages/UnifiedUpload'
import UploadQueue from './pages/UploadQueue'
import ProgressTracker from './pages/ProgressTracker'
import DocumentDetail from './pages/DocumentDetail'
import WorkflowDashboard from './pages/WorkflowDashboard'
import SalesUpload from './pages/SalesUpload'
import ServiceDeliveryUpload from './pages/ServiceDeliveryUpload'
import HRUpload from './pages/HRUpload'
import SalesQuestions from './pages/SalesQuestions'
import ServiceQuestions from './pages/ServiceQuestions'
import HRQuestions from './pages/HRQuestions'
import ChatBot from './components/ChatBot'
import { FileProvider } from './utils/FileContext'
import './App.css'

function Navigation() {
  const location = useLocation()

  return (
    <div className="top-nav">
      <div className="nav-brand">
        <div className="project-selector">
          <span className="project-icon">📋</span>
          <select className="project-dropdown">
            <option>Enterprise Project Alpha</option>
            <option>Project Beta</option>
            <option>Project Gamma</option>
          </select>
        </div>
      </div>
      <nav className="nav-links">
        <Link
          to="/"
          className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-icon">📤</span>
          Upload
        </Link>
        <Link
          to="/progress"
          className={
            location.pathname === '/progress' ? 'nav-link active' : 'nav-link'
          }
        >
          <span className="nav-icon">📈</span>
          Progress
        </Link>
        <Link
          to="/queue"
          className={
            location.pathname === '/queue' ? 'nav-link active' : 'nav-link'
          }
        >
          <span className="nav-icon">📊</span>
          Queue
        </Link>
        <Link
          to="/workflows"
          className={
            location.pathname === '/workflows' ? 'nav-link active' : 'nav-link'
          }
        >
          <span className="nav-icon">⚙️</span>
          Workflows
        </Link>
      </nav>
      <div className="nav-user">
        <div className="notification-bell">🔔</div>
        <div className="user-profile">
          <img
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM0RjhDRkYiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTggOEM5LjY1Njg1IDggMTEgNi42NTY4NSAxMSA1QzExIDMuMzQzMTUgOS42NTY4NSAyIDggMkM2LjM0MzE1IDIgNSAzLjM0MzE1IDUgNUM1IDYuNjU2ODUgNi4zNDMxNSA4IDggOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04IDEwQzUuNzkwODYgMTAgNCAyLjIwOTE0IDQgMTJIMTJDMTIgOS43OTA4NiAxMC4yMDkxIDggOCAxMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K"
            alt="User"
            className="user-avatar"
          />
          <span className="user-name">John Doe</span>
          <span className="user-role">Admin</span>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [chatOpen, setChatOpen] = useState(false)

  const toggleChat = () => {
    setChatOpen(!chatOpen)
  }

  return (
    <FileProvider>
      <Router>
        <div className="App">
          <header className="app-header">
            <div className="header-content">
              <div className="brand-logo">
                <div className="logo-icon">⚡</div>
                <div className="brand-text">
                  <span className="brand-name">Synoptic</span>
                  <span className="brand-suffix">AI</span>
                </div>
              </div>
              <div className="header-tagline">
                The Business Strategy Platform
              </div>
            </div>
          </header>
          <Navigation />
          <Routes>
            {/* Main upload page with tabs */}
            <Route path="/" element={<UnifiedUpload />} />
            <Route path="/upload" element={<UnifiedUpload />} />

            {/* Progress tracking */}
            <Route path="/progress" element={<ProgressTracker />} />

            {/* Queue and workflows */}
            <Route path="/queue" element={<UploadQueue />} />
            <Route path="/document/:id" element={<DocumentDetail />} />
            <Route path="/workflows" element={<WorkflowDashboard />} />

            {/* Legacy team-specific upload routes (for backward compatibility) */}
            <Route path="/sales-upload" element={<SalesUpload />} />
            <Route path="/service-upload" element={<ServiceDeliveryUpload />} />
            <Route path="/hr-upload" element={<HRUpload />} />

            {/* Team-specific question routes */}
            <Route path="/sales-questions" element={<SalesQuestions />} />
            <Route path="/service-questions" element={<ServiceQuestions />} />
            <Route path="/hr-questions" element={<HRQuestions />} />
          </Routes>
          <div className="footer">
            <div className="footer-left">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Documentation</a>
              <a href="#">API Reference</a>
            </div>
            <div className="footer-right">
              <span
                className="support-chat"
                title="24/7 AI Support"
                onClick={toggleChat}
                style={{ cursor: 'pointer' }}
              >
                🤖
              </span>
              <span className="version-badge">v2.1.0</span>
            </div>
          </div>

          {/* Floating Chat Button */}
          <button
            className={`floating-chat-btn ${chatOpen ? '' : 'pulse'}`}
            onClick={toggleChat}
            title="Ask SynapticAI Assistant"
          >
            {chatOpen ? '✕' : '🤖'}
          </button>

          {/* ChatBot Component */}
          <ChatBot isOpen={chatOpen} onClose={toggleChat} />
        </div>
      </Router>
    </FileProvider>
  )
}

export default App
