import { useEffect, useMemo, useState } from 'react'
import { getComponentsStructured } from '../shared/api.js'
import '../styles/browse.css'

function transformDB(db){
  const all = []
  for (const [category, items] of Object.entries(db)){
    for (const item of items){
      const avgPrice = item.vendors?.length ? Math.round(item.vendors.reduce((s,v)=>s+v.price,0)/item.vendors.length) : 0
      all.push({
        // create a unique id per category so keys are stable even if numeric ids repeat across categories
        uid: `${category}-${item.id}`,
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
  const [showFavorites, setShowFavorites] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)

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
  const toggleFavorite = (uid) => setFavorites(list => list.includes(uid) ? list.filter(x=>x!==uid) : [...list, uid])
  const toggleCompare = (uid) => setCompareList(list => list.includes(uid) ? list.filter(x=>x!==uid) : (list.length>=3 ? list : [...list, uid]))

  // helper to resolve an item from a stored id/uid
  const findItemByUid = (uidOrId) => {
    if (!uidOrId) return null
    // uid format: category-id
    if (typeof uidOrId === 'string' && uidOrId.includes('-')){
      return all.find(x => x.uid === uidOrId) || null
    }
    // fallback numeric id (legacy)
    return all.find(x => x.id === Number(uidOrId)) || null
  }

  const favoritesItems = favorites.map(f => findItemByUid(f)).filter(Boolean)
  const compareItems = compareList.map(c => findItemByUid(c)).filter(Boolean)

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

      {/* Favorites / Compare toolbar (centered below header) */}
      <div className="toolbar-row">
        <button className="toolbar-btn" onClick={()=>setShowFavorites(true)}>⭐ Favorites ({favoritesItems.length})</button>
        <button className="toolbar-btn" onClick={()=>setShowCompareModal(true)} disabled={compareItems.length===0}>⚖️ Compare ({compareItems.length})</button>
      </div>

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

      {/* Favorites modal */}
      {showFavorites && (
        <div className="modal-container active" role="dialog" aria-modal="true">
          <div className="modal-overlay" onClick={()=>setShowFavorites(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Favorites</h2>
              <button className="modal-close-btn" onClick={()=>setShowFavorites(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {favoritesItems.length===0 ? <p className="muted">No favorites yet.</p> : (
                <ul className="fav-list">
                  {favoritesItems.map(item => (
                    <li key={item.uid} className="fav-item">
                      <div>
                        <strong>{item.name}</strong>
                        <div className="muted">{getCategoryName(item.category)} — {item.brand}</div>
                      </div>
                      <div className="fav-actions">
                        <button className="btn" onClick={()=>{ openDetail(item); setShowFavorites(false) }}>View</button>
                        <button className="btn" onClick={()=> toggleFavorite(item.uid) }>Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compare modal (table) */}
      {showCompareModal && (
        <div className="modal-container active" role="dialog" aria-modal="true">
          <div className="modal-overlay" onClick={()=>setShowCompareModal(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Compare</h2>
              <button className="modal-close-btn" onClick={()=>setShowCompareModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {compareItems.length===0 ? <p className="muted">No items selected for comparison.</p> : (
                <div style={{overflowX:'auto'}}>
                  <table className="compare-table">
                    <thead>
                      <tr>
                        <th>Attribute</th>
                        {compareItems.map(it => (<th key={it.uid}>{it.name}</th>))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="attr">Category</td>
                        {compareItems.map(it => (<td key={it.uid+'-cat'}>{getCategoryName(it.category)}</td>))}
                      </tr>
                      <tr>
                        <td className="attr">Brand</td>
                        {compareItems.map(it => (<td key={it.uid+'-brand'}>{it.brand}</td>))}
                      </tr>
                      <tr>
                        <td className="attr">Price</td>
                        {compareItems.map(it => (<td key={it.uid+'-price'}>{getCheapestVendor(it) ? `₹${getCheapestVendor(it).price.toLocaleString('en-IN')}` : 'No offers'}</td>))}
                      </tr>
                      <tr>
                        <td className="attr">Specs</td>
                        {compareItems.map(it => (
                          <td key={it.uid+'-specs'}>
                            {[it.cores ? `${it.cores} cores` : null, it.memory || null, it.capacity || null, it.wattage ? `${it.wattage}W` : null, it.formFactor || null, it.ramType || null].filter(Boolean).join(' • ')}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="attr">Vendors</td>
                        {compareItems.map(it => (
                          <td key={it.uid+'-vendors'}>
                            {it.vendors?.length ? (
                              <ul className="vendor-compact">
                                {it.vendors.map((v,i)=> (<li key={i}>{v.name}: ₹{v.price.toLocaleString('en-IN')} {v.stock? '(In stock)':''}</li>))}
                              </ul>
                            ) : '—'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="attr">Actions</td>
                        {compareItems.map(it => (
                          <td key={it.uid+'-actions'}>
                            <div style={{display:'flex',gap:8}}>
                              <button className="btn" onClick={()=>{ openDetail(it); setShowCompareModal(false) }}>View</button>
                              <button className="btn" onClick={()=> toggleCompare(it.uid) }>Remove</button>
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{marginTop:'1rem', display:'flex', gap:'0.5rem'}}>
                <button className="btn" onClick={()=>{ setCompareList([]); setShowCompareModal(false) }}>Clear All</button>
                <button className="btn primary" onClick={()=>{ setShowCompareModal(false); }}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="grid">
        {results.length===0 ? <p className="muted">No components match your filters.</p> : results.map(item => {
          const cheapest = getCheapestVendor(item)
          // support both legacy numeric ids and new per-category uid values stored in localStorage
          const uid = item.uid || `${item.category}-${item.id}`
          const fav = favorites.includes(uid) || favorites.includes(item.id)
          const inCmp = compareList.includes(uid) || compareList.includes(item.id)
          return (
            <article key={uid} className="card">
              <div className="card-top">
                <span className="badge">{getCategoryName(item.category)}</span>
                <div className="icons">
                  <button className={"icon "+(fav?'active':'')} title="Favorite" onClick={()=>toggleFavorite(uid)}>{fav ? '⭐' : '☆'}</button>
                  <button className={"icon "+(inCmp?'active':'')} title="Compare" onClick={()=>toggleCompare(uid)} disabled={!inCmp && compareList.length>=3}>{inCmp ? '✓' : '⚖️'}</button>
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
