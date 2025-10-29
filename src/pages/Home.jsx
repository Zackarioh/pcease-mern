import React, { useEffect, useMemo, useState } from 'react'
import '../styles/home.css'
import { componentsDB as db } from '../shared/components-data.js'

function DBStats() {
  const { categories, total } = useMemo(() => {
    const categories = Object.keys(db)
    const total = categories.reduce((sum, k) => sum + (db[k]?.length || 0), 0)
    return { categories, total }
  }, [])
  return <div className="hero-stats"><span>{Object.keys(db).length} categories • {total} components</span></div>
}

function ForumInline() {
  const STORAGE_KEY = 'pc_forum_threads'
  const [threads, setThreads] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
  })
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ title: '', category: 'General', content: '' })

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(threads)) }, [threads])

  const filtered = useMemo(() => {
    const list = [...threads].sort((a,b)=>b.createdAt-a.createdAt)
    return filter ? list.filter(t=>t.category===filter) : list
  }, [threads, filter])

  const onSubmit = (e) => {
    e.preventDefault()
    const user = (JSON.parse(localStorage.getItem('pc_session')||'null')||{}).username || 'Guest'
    if (!user || user==='Guest') { window.location.href = '/login?redirect=/' ; return }
    if (!form.title.trim() || !form.content.trim()) return
    setThreads(prev => [{ id: Date.now(), user, createdAt: Date.now(), ...form }, ...prev])
    setForm({ title: '', category: 'General', content: '' })
  }
  const clearAll = () => { if (confirm('Clear all threads stored in this browser?')) setThreads([]) }

  return (
    <section id="community" className="forum" aria-labelledby="community-title">
      <div className="container">
        <h2 id="community-title" className="section-title">Community Forum</h2>
        <p className="forum-subtitle">Discuss PC builds, share the latest trends, and help each other out. Your posts are saved locally in your browser.</p>
        <div className="forum-layout">
          <div className="forum-column">
            <form className="new-thread-form" onSubmit={onSubmit} aria-label="Create a new thread">
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="thread-title">Title</label>
                  <input type="text" id="thread-title" placeholder="e.g., Help choosing between 4070 and 7800 XT" required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
                </div>
                <div className="form-field">
                  <label htmlFor="thread-category">Category</label>
                  <select id="thread-category" required value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                    <option value="General">General</option>
                    <option value="Builds">Builds</option>
                    <option value="Troubleshooting">Troubleshooting</option>
                    <option value="News">News</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="thread-content">Content</label>
                <textarea id="thread-content" rows="4" placeholder="Share your question or topic..." required value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))}></textarea>
              </div>
              <button type="submit" className="cta-button">Post Thread</button>
            </form>
          </div>

          <div className="forum-column">
            <div className="forum-toolbar">
              <div className="forum-filter">
                <label htmlFor="filter-category">Filter:</label>
                <select id="filter-category" value={filter} onChange={e=>setFilter(e.target.value)}>
                  <option value="">All</option>
                  <option value="General">General</option>
                  <option value="Builds">Builds</option>
                  <option value="Troubleshooting">Troubleshooting</option>
                  <option value="News">News</option>
                </select>
              </div>
              <button className="secondary-button" type="button" title="Clear all threads" onClick={clearAll}>Clear All</button>
            </div>
            <div id="threads-list" className="threads-list" aria-live="polite">
              {filtered.length===0 ? <p className="forum-empty">No threads yet. Be the first to post!</p> : filtered.map(t => (
                <article key={t.id} className="thread-card">
                  <div className="thread-header">
                    <h3 className="thread-title">{t.title}</h3>
                    <div className="thread-meta">
                      <span className="thread-badge">{t.category}</span>
                      <span className="thread-date">{new Date(t.createdAt).toLocaleString()}</span>
                      <span className="thread-author">by {t.user || 'Guest'}</span>
                    </div>
                  </div>
                  <p className="thread-content">{t.content}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main>
      <header className="hero">
        <div className="hero-content container">
          <h1>Build Your Dream PC with Confidence</h1>
          <p>Smart, stress-free PC building for everyone.</p>
          <div className="hero-actions">
            <a href="/builder" className="cta-button">Start Building</a>
            <a href="/browse" className="secondary-button">Browse Components</a>
          </div>
          <DBStats />
        </div>
      </header>

      <section className="about" aria-labelledby="about-title">
        <div className="container">
          <h2 id="about-title" className="section-title">About PCease</h2>
          <p>
            PCease helps you plan and build your next PC with confidence. Use the PC Builder to pick parts,
            and the Browse page to explore components and prices. Whether you're new to PC building or an enthusiast,
            we're here to make it simple and fun.
          </p>
        </div>
      </section>

      <section className="features" aria-labelledby="features-title">
        <div className="container">
          <h2 id="features-title" className="section-title">Why Choose PCease</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Clarity First</h3>
              <p>Clean layout and simple flows keep you focused on what matters—your build.</p>
            </div>
            <div className="feature-card">
              <h3>Smart Checks</h3>
              <p>We highlight brand, RAM, and form-factor compatibility while you pick parts.</p>
            </div>
            <div className="feature-card">
              <h3>Price Awareness</h3>
              <p>Compare vendor prices side-by-side in the Browse page before you buy.</p>
            </div>
          </div>
        </div>
      </section>

      <ForumInline />

      <section className="categories" aria-labelledby="categories-title">
        <div className="container">
          <h2 id="categories-title" className="section-title">Explore Components</h2>
          <div className="card-grid">
            <a className="card" href="/browse?category=cpu#search" aria-label="Browse CPUs">
              <div className="card-emoji">🧠</div>
              <h3>CPUs</h3>
              <p>Ryzen, Core, and more</p>
            </a>
            <a className="card" href="/browse?category=gpu#search" aria-label="Browse GPUs">
              <div className="card-emoji">🎮</div>
              <h3>GPUs</h3>
              <p>GeForce, Radeon</p>
            </a>
            <a className="card" href="/browse?category=motherboard#search" aria-label="Browse Motherboards">
              <div className="card-emoji">🧩</div>
              <h3>Motherboards</h3>
              <p>AM5, LGA1700</p>
            </a>
            <a className="card" href="/browse?category=ram#search" aria-label="Browse Memory">
              <div className="card-emoji">⚡</div>
              <h3>Memory</h3>
              <p>DDR4/DDR5 kits</p>
            </a>
            <a className="card" href="/browse?category=storage#search" aria-label="Browse Storage">
              <div className="card-emoji">💾</div>
              <h3>Storage</h3>
              <p>NVMe, SATA SSDs</p>
            </a>
            <a className="card" href="/browse?category=pcCase#search" aria-label="Browse Cases">
              <div className="card-emoji">🧱</div>
              <h3>Cases</h3>
              <p>ATX, mATX, ITX</p>
            </a>
            <a className="card" href="/browse?category=psu#search" aria-label="Browse PSUs">
              <div className="card-emoji">🔋</div>
              <h3>PSUs</h3>
              <p>Certified power supplies</p>
            </a>
            <a className="card" href="/browse?category=monitor#search" aria-label="Browse Monitors">
              <div className="card-emoji">🖥️</div>
              <h3>Monitors</h3>
              <p>Displays for all needs</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
