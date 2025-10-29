import React, { useEffect, useMemo, useState } from 'react'
import '../styles/browse.css'
import { componentsDB } from '../shared/components-data.js'

function transformDB(db) {
  const all = []
  Object.entries(db).forEach(([category, items]) => {
    items.forEach(item => {
      const avgPrice = item.vendors && item.vendors.length > 0
        ? Math.round(item.vendors.reduce((sum, v) => sum + v.price, 0) / item.vendors.length)
        : 0
      all.push({
        id: item.id,
        name: item.name,
        category,
        brand: item.brand || 'Generic',
        price: avgPrice,
        vendors: item.vendors || [],
        ramType: item.ramType,
        formFactor: item.formFactor,
        cores: item.cores,
        memory: item.memory,
        capacity: item.capacity,
        wattage: item.wattage,
        socket: item.socket
      })
    })
  })
  return all
}

function getCategoryName(cat) {
  const names = { cpu:'Processor', gpu:'Graphics Card', motherboard:'Motherboard', ram:'Memory (RAM)', storage:'Storage', psu:'Power Supply', pcCase:'Case', monitor:'Monitor' }
  return names[cat] || cat.toUpperCase()
}

function getCheapestVendor(component) {
  if (!component?.vendors?.length) return null
  const inStock = component.vendors.filter(v => v.stock)
  const list = inStock.length ? inStock : component.vendors
  return list.reduce((min, v) => v.price < min.price ? v : min, list[0])
}

export default function Browse() {
  const allComponents = useMemo(() => transformDB(componentsDB), [])
  const [activeFilter, setActiveFilter] = useState('all')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState(() => (JSON.parse(localStorage.getItem('favorites')||'[]')||[]))
  const [compareList, setCompareList] = useState(() => (JSON.parse(localStorage.getItem('compareList')||'[]')||[]))
  const [recentlyViewed, setRecentlyViewed] = useState(() => (JSON.parse(localStorage.getItem('recentlyViewed')||'[]')||[]))
  const [showFav, setShowFav] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(()=>{ localStorage.setItem('favorites', JSON.stringify(favorites)) }, [favorites])
  useEffect(()=>{ localStorage.setItem('compareList', JSON.stringify(compareList)) }, [compareList])
  useEffect(()=>{ localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed)) }, [recentlyViewed])

  const brands = useMemo(() => [...new Set(allComponents.map(c=>c.brand).filter(Boolean))].sort(), [allComponents])
  const categories = useMemo(() => ['all', ...new Set(allComponents.map(c=>c.category))], [allComponents])

  const results = useMemo(() => {
    let r = [...allComponents]
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(i => i.name.toLowerCase().includes(q) || (i.brand && i.brand.toLowerCase().includes(q)))
    }
    if (activeFilter !== 'all') r = r.filter(i => i.category === activeFilter)
    if (priceMin !== '') r = r.filter(i => i.price >= parseFloat(priceMin))
    if (priceMax !== '') r = r.filter(i => i.price <= parseFloat(priceMax))
    if (selectedBrand) r = r.filter(i => i.brand === selectedBrand)
    r.sort((a,b)=>a.price-b.price)
    return r
  }, [allComponents, search, activeFilter, priceMin, priceMax, selectedBrand])

  const toggleFavorite = (id) => {
    setFavorites(list => list.includes(id) ? list.filter(x=>x!==id) : [...list, id])
  }
  const toggleCompare = (id) => {
    setCompareList(list => list.includes(id) ? list.filter(x=>x!==id) : (list.length>=3 ? list : [...list, id]))
  }
  const addViewed = (id) => {
    setRecentlyViewed(list => {
      const filtered = list.filter(x=>x!==id)
      return [id, ...filtered].slice(0,6)
    })
  }

  const comparisonComponents = compareList.map(id => allComponents.find(c=>c.id===id)).filter(Boolean)

  return (
    <main className="container">
      <header className="page-header">
        <h1>🔍 Component Database</h1>
        <p>Search, filter, and compare PC components with live market prices. Press <kbd>Ctrl+K</kbd> to quick search.</p>
      </header>

      <div className="browse-toolbar">
        <button className="toolbar-btn primary" onClick={()=>setModalOpen(true)}>
          <span className="btn-icon">🔍</span><span className="btn-text">Search Components</span>
        </button>
        <button className="toolbar-btn" onClick={()=>{setShowCompare(true)}} disabled={compareList.length===0}>
          <span className="btn-icon">⚖️</span><span className="btn-text">Compare (<span>{compareList.length}</span>)</span>
        </button>
        <button className="toolbar-btn" onClick={()=>{setShowFav(true)}}>
          <span className="btn-icon">⭐</span><span className="btn-text">Favorites (<span>{favorites.length}</span>)</span>
        </button>
      </div>

      {recentlyViewed.length>0 && (
        <section className="recently-viewed-section">
          <h2>⏱️ Recently Viewed</h2>
          <div className="component-grid">
            {recentlyViewed.map(id => {
              const c = allComponents.find(x=>x.id===id); if(!c) return null
              const isFavorite = favorites.includes(c.id)
              const cheapestVendor = getCheapestVendor(c)
              return (
                <div key={c.id} className="component-card">
                  <div className="component-card-header">
                    <div className="component-category-badge">{getCategoryName(c.category)}</div>
                    <div className="component-actions">
                      <button className={"action-icon-btn favorite "+(isFavorite?'active':'')} onClick={()=>toggleFavorite(c.id)} title="Add to favorites">⭐</button>
                    </div>
                  </div>
                  <div className="component-name">{c.name}</div>
                  {c.vendors?.length>0 && (
                    <ul className="vendor-list-mini">
                      {c.vendors.slice(0,2).map((v,i)=>(<li key={i} className="vendor-mini"><a href={v.url} target="_blank" rel="noreferrer">{v.name}</a><span>₹{v.price.toLocaleString()}</span></li>))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {showFav && (
        <section className="favorites-section">
          <div className="section-header">
            <h2>⭐ Your Favorites</h2>
            <button className="close-section-btn" onClick={()=>setShowFav(false)}>✕</button>
          </div>
          <div className="component-grid">
            {favorites.length===0 ? <p style={{textAlign:'center', color:'var(--muted)'}}>No favorites yet. Add components to your favorites!</p> : favorites.map(id => {
              const c = allComponents.find(x=>x.id===id); if(!c) return null
              const isFavorite = favorites.includes(c.id)
              return (
                <div key={c.id} className="component-card">
                  <div className="component-card-header">
                    <div className="component-category-badge">{getCategoryName(c.category)}</div>
                    <div className="component-actions">
                      <button className={"action-icon-btn favorite "+(isFavorite?'active':'')} onClick={()=>toggleFavorite(c.id)} title="Remove from favorites">⭐</button>
                    </div>
                  </div>
                  <div className="component-name">{c.name}</div>
                  {c.vendors?.length>0 && (
                    <ul className="vendor-list-mini">
                      {c.vendors.slice(0,2).map((v,i)=>(<li key={i} className="vendor-mini"><a href={v.url} target="_blank" rel="noreferrer">{v.name}</a><span>₹{v.price.toLocaleString()}</span></li>))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {showCompare && (
        <section className="comparison-section">
          <div className="section-header">
            <h2>⚖️ Component Comparison</h2>
            <button className="close-section-btn" onClick={()=>setShowCompare(false)}>✕</button>
          </div>
          <div className="comparison-table-container">
            {comparisonComponents.length===0 ? <p style={{textAlign:'center', color:'var(--muted)'}}>No components selected for comparison.</p> : (
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    {comparisonComponents.map(c => (
                      <th key={c.id} className="component-col">
                        {c.name}<br />
                        <button className="remove-compare-btn" onClick={()=>toggleCompare(c.id)}>Remove</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'category', label: 'Category', fmt: getCategoryName },
                    { key: 'price', label: 'Price', fmt: (v)=>`₹${v.toLocaleString()}` },
                    { key: 'brand', label: 'Brand' },
                    { key: 'cores', label: 'Cores' },
                    { key: 'memory', label: 'Memory' },
                    { key: 'capacity', label: 'Capacity' },
                    { key: 'wattage', label: 'Wattage', fmt: (v)=>`${v}W` },
                    { key: 'formFactor', label: 'Form Factor' }
                  ].map(row => (
                    <tr key={row.key}>
                      <td><strong>{row.label}</strong></td>
                      {comparisonComponents.map(c => {
                        const v = c[row.key]
                        return <td key={c.id+row.key} className="component-col">{v ? (row.fmt ? row.fmt(v) : v) : '-'}</td>
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td><strong>Buy</strong></td>
                    {comparisonComponents.map(c => {
                      const ch = getCheapestVendor(c)
                      return <td key={'buy-'+c.id} className="component-col">{ch ? <a className="buy-now-btn" href={ch.url} target="_blank" rel="noreferrer">🛒 {ch.name} (₹{ch.price.toLocaleString('en-IN')})</a> : '-'}</td>
                    })}
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {modalOpen && (
        <div className="modal-container active" role="dialog" aria-modal="true" aria-labelledby="search-modal-title">
          <div className="modal-overlay" onClick={()=>setModalOpen(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="search-modal-title">🔍 Search Components</h2>
              <button className="modal-close-btn" aria-label="Close search modal" type="button" onClick={()=>setModalOpen(false)}>&times;</button>
            </div>
            <div className="search-input-wrapper">
              <input type="search" id="search-input" placeholder="e.g., RTX 4070 Ti, Ryzen 7, Samsung 990..." aria-label="Search components" autoFocus value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <div className="advanced-filters">
              <div className="filter-group">
                <label htmlFor="price-min">Price Range:</label>
                <div className="price-range-inputs">
                  <input type="number" id="price-min" placeholder="Min" min="0" value={priceMin} onChange={e=>setPriceMin(e.target.value)} />
                  <span>—</span>
                  <input type="number" id="price-max" placeholder="Max" min="0" value={priceMax} onChange={e=>setPriceMax(e.target.value)} />
                </div>
              </div>
              <div className="filter-group">
                <label htmlFor="brand-filter">Brand:</label>
                <select id="brand-filter" value={selectedBrand} onChange={e=>setSelectedBrand(e.target.value)}>
                  <option value="">All Brands</option>
                  {brands.map(b=> <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <button className="clear-filters-btn" onClick={()=>{ setPriceMin(''); setPriceMax(''); setSelectedBrand(''); setActiveFilter('all'); setSearch('') }}>Clear Filters</button>
            </div>
            <div className="search-filters" role="toolbar" aria-label="Filter components by category">
              {categories.map(cat => (
                <button key={cat} className={"filter-btn "+(cat===activeFilter?'active':'')} onClick={()=>setActiveFilter(cat)}>
                  {getCategoryName(cat)} ({cat==='all' ? allComponents.length : allComponents.filter(c=>c.category===cat).length})
                </button>
              ))}
            </div>
            <div id="search-results-body" className="modal-body" role="region" aria-live="polite" aria-label="Search results">
              {results.length===0 ? <p className="search-prompt">No components found matching your criteria.</p> : results.map(item => {
                const isFavorite = favorites.includes(item.id)
                const isInCompare = compareList.includes(item.id)
                const cheapestVendor = getCheapestVendor(item)
                return (
                  <div key={item.id} className="component-item" onClick={()=>addViewed(item.id)}>
                    <div className="component-item-header">
                      <h4 className="component-item-name">{item.name}</h4>
                      <div className="component-item-actions">
                        <button className={"action-icon-btn favorite "+(isFavorite?'active':'')} onClick={(e)=>{e.stopPropagation(); toggleFavorite(item.id)}} title="Add to favorites">{isFavorite ? '⭐' : '☆'}</button>
                        <button className={"action-icon-btn compare "+(isInCompare?'active':'')} onClick={(e)=>{e.stopPropagation(); toggleCompare(item.id)}} title="Add to comparison" disabled={compareList.length>=3 && !isInCompare}>{isInCompare ? '✓' : '⚖️'}</button>
                        {cheapestVendor && <a className="buy-now-btn" onClick={(e)=>e.stopPropagation()} href={cheapestVendor.url} target="_blank" rel="noreferrer" title={`Buy at ${cheapestVendor.name}`}>🛒 Buy ₹{cheapestVendor.price.toLocaleString('en-IN')}</a>}
                      </div>
                    </div>
                    <small className="component-category-badge">{getCategoryName(item.category)}</small>
                    {item.vendors?.length>0 ? (
                      <ul className="vendor-list">
                        {item.vendors.map((v,i)=> (
                          <li key={i} className="vendor-item">
                            <a href={v.url} target="_blank" rel="noreferrer" className="vendor-link">{v.name}</a>
                            <span className={"stock-status "+(v.stock?'in-stock':'out-of-stock')}>{v.stock ? 'In Stock' : 'Out of Stock'}</span>
                            <span className="vendor-price">₹{v.price.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    ) : <p className="no-vendors">No vendors available</p>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
