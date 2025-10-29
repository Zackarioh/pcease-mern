// LocalStorage-based auth (ported from auth.js)

const USERS_KEY = 'pc_users'
const SESSION_KEY = 'pc_session'

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}') } catch { return {} }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}
export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}
function setSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}
export function isLoggedIn() { return !!getSession() }

async function sha256(text) {
  if (window.crypto?.subtle) {
    const enc = new TextEncoder()
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(text))
    const bytes = Array.from(new Uint8Array(buf))
    return bytes.map(b => b.toString(16).padStart(2,'0')).join('')
  }
  return btoa(unescape(encodeURIComponent(text)))
}

export async function register(username, password) {
  const users = loadUsers()
  if (users[username]) throw new Error('User already exists')
  const hash = await sha256(password)
  users[username] = { hash, createdAt: Date.now() }
  saveUsers(users)
  return true
}

export async function login(username, password) {
  const users = loadUsers()
  const user = users[username]
  if (!user) throw new Error('User not found')
  const hash = await sha256(password)
  if (hash !== user.hash) throw new Error('Invalid credentials')
  setSession({ username, loggedInAt: Date.now() })
  return true
}

export function logout() { setSession(null) }

export function requireLogin(navigate, redirectUrl) {
  if (!isLoggedIn()) {
    navigate('/login?redirect=' + encodeURIComponent(redirectUrl || window.location.pathname))
    return false
  }
  return true
}
