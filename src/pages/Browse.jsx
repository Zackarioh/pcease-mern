import React, { useEffect, useMemo, useState } from 'react'
import '../styles/browse.css'
import { getComponentsStructured } from '../shared/api.js'

function transformDB(db){
  const all = []
  for (const [category, items] of Object.entries(db)){
    for (const item of items){
      const avgPrice = item.vendors?.length ? Math.round(item.vendors.reduce((s,v)=>s+v.price,0)/item.vendors.length) : 0
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
    }
  }
  return all
}

function getCategoryName(cat){
  const names = { cpu:'Processor', gpu:'Graphics Card', motherboard:'Motherboard', ram:'Memory (RAM)', storage:'Storage', psu:'Power Supply', pcCase:'Case', monitor:'Monitor' }
  if (cat==='all') return 'All'
  return names[cat] || cat?.toUpperCase()
}

function getCheapestVendor(component){
  if (!component?.vendors?.length) return null
  const inStock = component.vendors.filter(v=>v.stock)
  const list = inStock.length ? inStock : component.vendors
  return list.reduce((min,v)=> v.price < min.price ? v : min, list[0])
}

export default function Browse(){
  const [db, setDb] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(()=>{
    let active = true
    ;(async()=>{
      try{ const grouped = await getComponentsStructured(); if(active) setDb(grouped) }
      catch{ if(active) setError('Failed to load components') }
      finally{ if(active) setLoading(false) }
    })()
    return ()=>{ active = false }
  }, [])

  const all = useMemo(()=>transformDB(db), [db])
  const brands = useMemo(()=>[...new Set(all.map(c=>c.brand).filter(Boolean))].sort(), [all])
  const categories = useMemo(()=>['all', ...new Set(all.map(c=>c.category))], [all])

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [brand, setBrand] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [favorites, setFavorites] = useState(()=> JSON.parse(localStorage.getItem('favorites')||'[]')||[])
  const [compareList, setCompareList] = useState(()=> JSON.parse(localStorage.getItem('compareList')||'[]')||[])
  const [detail, setDetail] = useState({ open:false, item:null })

  useEffect(()=>{ localStorage.setItem('favorites', JSON.stringify(favorites)) }, [favorites])
  useEffect(()=>{ localStorage.setItem('compareList', JSON.stringify(compareList)) }, [compareList])

  const results = useMemo(()=>{
    let r = [...all]
    const q = search.trim().toLowerCase()
    if (q) r = r.filter(i => i.name.toLowerCase().includes(q) || i.brand?.toLowerCase().includes(q))
    if (category !== 'all') r = r.filter(i => i.category === category)
    if (brand) r = r.filter(i => i.brand === brand)
    if (minPrice!=='') r = r.filter(i => i.price >= Number(minPrice))
    if (maxPrice!=='') r = r.filter(i => i.price <= Number(maxPrice))
    return r.sort((a,b)=> a.price-b.price)
  }, [all, search, category, brand, minPrice, maxPrice])

  const openDetail = (item) => setDetail({ open:true, item })
  const closeDetail = () => setDetail({ open:false, item:null })
  const toggleFavorite = (id) => setFavorites(list => list.includes(id) ? list.filter(x=>x!==id) : [...list, id])
  const toggleCompare = (id) => setCompareList(list => list.includes(id) ? list.filter(x=>x!==id) : (list.length>=3 ? list : [...list, id]))

  if (loading) return (
    <main className="container"><header className="page-header"><h1>Browse Components</h1><p>Loading components…</p></header></main>
  )
  if (error) return <main className="container"><header className="page-header"><h1>Browse Components</h1><p style={{color:'var(--muted)'}}>{error}</p></header></main>

  return (
    <main className="container">
      <header className="page-header">
        <h1>Browse Components</h1>
        <p>Find the right part by category, brand, and price, then compare or buy from listed vendors.</p>
      </header>

      <section className="controls">
        <input className="control-input" type="search" placeholder="Search by name or brand…" value={search} onChange={e=>setSearch(e.target.value)} />
        <div className="row">
          <div className="chips" role="toolbar" aria-label="Filter by category">
            {categories.map(c => (
              <button key={c} className={"chip "+(c===category?'active':'')} onClick={()=>setCategory(c)}>{getCategoryName(c)}</button>
            ))}
          </div>
          <div className="filters">
            <select className="control-select" value={brand} onChange={e=>setBrand(e.target.value)}>
              <option value="">All brands</option>
              {brands.map(b=> <option key={b} value={b}>{b}</option>)}
            </select>
            <div className="price">
              <input className="control-number" type="number" placeholder="Min ₹" min="0" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
              <span>—</span>
              <input className="control-number" type="number" placeholder="Max ₹" min="0" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
            </div>
            <button className="clear" onClick={()=>{ setSearch(''); setCategory('all'); setBrand(''); setMinPrice(''); setMaxPrice('') }}>Clear</button>
          </div>
        </div>
      </section>

      <section className="grid">
        {results.length===0 ? <p className="muted">No components match your filters.</p> : results.map(item => {
          const cheapest = getCheapestVendor(item)
          const fav = favorites.includes(item.id)
          const inCmp = compareList.includes(item.id)
          return (
            <article key={item.id} className="card">
              <div className="card-top">
                <span className="badge">{getCategoryName(item.category)}</span>
                <div className="icons">
                  <button className={"icon "+(fav?'active':'')} title="Favorite" onClick={()=>toggleFavorite(item.id)}>{fav ? '⭐' : '☆'}</button>
                  <button className={"icon "+(inCmp?'active':'')} title="Compare" onClick={()=>toggleCompare(item.id)} disabled={!inCmp && compareList.length>=3}>{inCmp ? '✓' : '⚖️'}</button>
                </div>
              </div>
              <h3 className="title" title={item.name}>{item.name}</h3>
              {cheapest ? <div className="price">From ₹{cheapest.price.toLocaleString('en-IN')}</div> : <div className="price muted">No offers</div>}
              <div className="actions">
                <button className="btn" onClick={()=>openDetail(item)}>View Details</button>
                {cheapest && <a className="btn primary" href={cheapest.url} target="_blank" rel="noreferrer">Buy</a>}
              </div>
            </article>
          )
        })}
      </section>

      {detail.open && detail.item && (
        <div className="modal-container active" role="dialog" aria-modal="true" aria-labelledby="detail-title">
          <div className="modal-overlay" onClick={closeDetail}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="detail-title">{detail.item.name}</h2>
              <button className="modal-close-btn" onClick={closeDetail}>&times;</button>
            </div>
            <div className="modal-body two-col">
              <div className="col">
                <div className="meta">
                  <span className="badge">{getCategoryName(detail.item.category)}</span>
                  <span className="muted">{detail.item.brand}</span>
                </div>
                <ul className="specs">
                  {detail.item.cores ? <li><strong>Cores:</strong> {detail.item.cores}</li> : null}
                  {detail.item.memory ? <li><strong>Memory:</strong> {detail.item.memory}</li> : null}
                  {detail.item.capacity ? <li><strong>Capacity:</strong> {detail.item.capacity}</li> : null}
                  {detail.item.wattage ? <li><strong>Wattage:</strong> {detail.item.wattage}W</li> : null}
                  {detail.item.formFactor ? <li><strong>Form Factor:</strong> {detail.item.formFactor}</li> : null}
                  {detail.item.ramType ? <li><strong>RAM Type:</strong> {detail.item.ramType}</li> : null}
                </ul>
              </div>
              <div className="col">
                {detail.item.vendors?.length ? (
                  <ul className="vendor-list">
                    {detail.item.vendors.map((v,i)=> (
                      <li key={i} className="vendor-item">
                        <a className="vendor-link" href={v.url} target="_blank" rel="noreferrer">{v.name}</a>
                        <span className={"stock-status "+(v.stock?'in-stock':'out-of-stock')}>{v.stock ? 'In Stock' : 'Out of Stock'}</span>
                        <span className="vendor-price">₹{v.price.toLocaleString('en-IN')}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="muted">No vendors listed.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
