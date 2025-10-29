import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Browse from './pages/Browse.jsx'
import Builder from './pages/Builder.jsx'
import Forum from './pages/Forum.jsx'
import Login from './pages/Login.jsx'
import Query from './pages/Query.jsx'
import { useTheme } from './lib/theme.js'
import { AuthNav } from './components/AuthNav.jsx'

function NavBar() {
  const { theme, toggle } = useTheme()
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="brand-logo">PCease 🖥️</Link>
        <ul className="nav-links">
          <li><Link to="/browse">Browse Components</Link></li>
          <li><Link to="/builder">PC Builder</Link></li>
          <li><Link to="/query">Build Advisor</Link></li>
          <li><Link to="/forum">Forum</Link></li>
          <li>
            <button id="theme-toggle" className="theme-toggle-btn" type="button" aria-pressed={theme==='dark'} title="Toggle dark mode" onClick={toggle}>
              <span className="theme-icon">{theme==='dark' ? '☀️' : '🌙'}</span>
              <span className="theme-text">{theme==='dark' ? 'Light' : 'Dark'}</span>
            </button>
          </li>
          <li><AuthNav /></li>
        </ul>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <p>© {new Date().getFullYear()} PCease. Build with confidence.</p>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/login" element={<Login />} />
        <Route path="/query" element={<Query />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  )
}
