import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSession, isLoggedIn, logout } from '../lib/auth.js'

export function AuthNav() {
  const navigate = useNavigate()
  const session = getSession()
  if (isLoggedIn()) {
    return (
      <span className="nav-user">
        👋 {session.username} <button className="theme-toggle-btn" onClick={() => { logout(); navigate(0) }}>Logout</button>
      </span>
    )
  }
  return <Link to="/login" className="nav-login-link">Login</Link>
}
