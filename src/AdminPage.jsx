import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient("https://dmqgbxjnfkjnkpfirfdl.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcWdieGpuZmtqbmtwZmlyZmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDA0NzYsImV4cCI6MjA5MTY3NjQ3Nn0.y16FCg_HXkd7Ua_CU7K2o5Kd-QuEXxbz18hZsj4GaHI")

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [admin, setAdmin] = useState(null)
  const [error, setError] = useState('')
  const [yachts, setYachts] = useState([])
  const [charters, setCharters] = useState([])
  const [newYachtName, setNewYachtName] = useState('')
  const [newYachtPassword, setNewYachtPassword] = useState('')
  const [newCharterName, setNewCharterName] = useState('')
  const [selectedYacht, setSelectedYacht] = useState(null)
  const [creating, setCreating] = useState(false)
  const [editingPassword, setEditingPassword] = useState(null)
  const [newCrewPassword, setNewCrewPassword] = useState('')

  const login = async () => {
    const { data } = await supabase.from('admins').select('*').eq('password', password).single()
    if (data) { setAdmin(data); setUnlocked(true); fetchYachts(data.id) }
    else setError('Incorrect password.')
  }

  const fetchYachts = async (agencyId) => {
    const id = agencyId || admin?.id
    const { data } = await supabase.from('yachts').select('*').eq('agency_id', id).order('created_at', { ascending: false })
    if (data) setYachts(data)
  }

  const refreshCharters = async (yachtId) => {
    const id = yachtId || selectedYacht?.id
    if (!id) return
    const { data } = await supabase.from('charters').select('*').eq('yacht_id', id).order('created_at', { ascending: false })
    if (data) setCharters(data.filter(c => c.active === true || c.active === null))
  }

  const createYacht = async () => {
    if (!newYachtName.trim()) return
    setCreating(true)
    await supabase.from('yachts').insert({ 
      name: newYachtName.trim(), 
      agency_id: admin.id,
      crew_password: newYachtPassword.trim() || 'crew2026'
    })
    setNewYachtName('')
    setNewYachtPassword('')
    await fetchYachts()
    setCreating(false)
  }

  const updateCrewPassword = async (yachtId, pwd) => {
    await supabase.from('yachts').update({ crew_password: pwd }).eq('id', yachtId)
    setEditingPassword(null)
    await fetchYachts()
  }

  const createCharter = async () => {
    if (!newCharterName.trim() || !selectedYacht) return
    setCreating(true)
    await supabase.from('charters').insert({ name: newCharterName.trim(), yacht_id: selectedYacht.id, active: null })
    setNewCharterName('')
    await refreshCharters()
    setCreating(false)
  }

  const setActive = async (charterId) => {
    await supabase.from('charters').update({ active: null }).eq('yacht_id', selectedYacht.id).neq('id', charterId).is('active', true)
    await supabase.from('charters').update({ active: true }).eq('id', charterId)
    await refreshCharters()
  }

  const endCharter = async (charterId) => {
    if (!window.confirm('End this charter? Guest profiles will be archived.')) return
    await supabase.from('guests').update({ archived: true }).eq('charter_id', charterId)
    await supabase.from('charters').update({ active: false }).eq('id', charterId)
    await refreshCharters()
  }

  const deleteYacht = async (yachtId) => {
  if (!window.confirm('Delete this yacht? Charters will be deleted but guest profiles will be preserved.')) return
  const { data: charterData } = await supabase.from('charters').select('id').eq('yacht_id', yachtId)
  if (charterData) {
    for (const charter of charterData) {
      await supabase.from('guests').update({ charter_id: null }).eq('charter_id', charter.id)
    }
  }
  await supabase.from('charters').delete().eq('yacht_id', yachtId)
  await supabase.from('yachts').delete().eq('id', yachtId)
  if (selectedYacht?.id === yachtId) { setSelectedYacht(null); setCharters([]) }
  await fetchYachts()
}

  const baseUrl = window.location.origin

  if (!unlocked) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
        <nav>
  <svg width="160" height="32" viewBox="0 0 300 60" xmlns="http://www.w3.org/2000/svg">
    <text x="150" y="38" textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="28" fontWeight="300" fill="#ffffff" letterSpacing="8">THE GALLEY</text>
    <line x1="60" y1="46" x2="240" y2="46" stroke="#c9a96e" strokeWidth="0.8"/>
  </svg>
</nav>
        <main style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}>
          <div style={{width:'100%',maxWidth:'360px'}}>
            <div className="page-header" style={{textAlign:'center'}}>
              <h1>Agency <em>Login</em></h1>
              <p>Enter your agency password to manage charters.</p>
            </div>
            <div className="field" style={{marginTop:'32px'}}>
              <label>Password</label>
              <input type="password" placeholder="Enter agency password" value={password} onChange={e => { setPassword(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && login()} style={{borderColor: error ? 'var(--danger)' : undefined}}/>
              {error && <p style={{fontSize:'12px',color:'var(--danger)',marginTop:'6px'}}>{error}</p>}
            </div>
            <button className="btn-primary" onClick={login}>Access Agency Dashboard</button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <nav>
        <div className="brand">Provisio</div>
        <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',letterSpacing:'.08em'}}>{admin?.agency}</div>
      </nav>
      <main>
        <div className="page-header">
          <h1>Agency <em>Dashboard</em></h1>
          <p>Manage your yachts and charters.</p>
        </div>

        <div className="section">
          <div className="section-label">Add a Yacht</div>
          <div className="field">
            <label>Yacht name</label>
            <input placeholder="e.g. Lady Stephanie" value={newYachtName} onChange={e => setNewYachtName(e.target.value)}/>
          </div>
          <div className="field">
            <label>Crew password</label>
            <input placeholder="e.g. ladystephanie2026" value={newYachtPassword} onChange={e => setNewYachtPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && createYacht()}/>
          </div>
          <button className="btn-add" onClick={createYacht} disabled={creating} style={{width:'100%',padding:'12px',fontSize:'20px'}}>+</button>
        </div>

        <div className="section">
          <div className="section-label">Your Yachts</div>
          {yachts.length === 0 ? (
            <p style={{fontSize:'13px',color:'var(--muted)'}}>No yachts yet. Add your first one above.</p>
          ) : (
            yachts.map(y => (
              <div key={y.id} style={{background:'#fff',border:`1px solid ${selectedYacht?.id===y.id ? 'var(--accent)' : 'var(--border)'}`,borderRadius:'2px',padding:'16px 20px',marginBottom:'8px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
                  <div onClick={() => { setSelectedYacht(y); refreshCharters(y.id) }} style={{fontFamily:'Cormorant Garamond, serif',fontSize:'20px',fontWeight:300,cursor:'pointer'}}>{y.name}</div>
                  <button onClick={() => deleteYacht(y.id)} style={{fontSize:'11px',padding:'3px 10px',background:'transparent',color:'var(--danger)',border:'1px solid var(--danger)',borderRadius:'2px',cursor:'pointer'}}>Delete</button>
                </div>

                <div style={{marginBottom:'8px'}}>
                  <div style={{fontSize:'11px',color:'var(--muted)',marginBottom:'4px'}}>Permanent crew link:</div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <div style={{fontSize:'12px',color:'var(--ink)',wordBreak:'break-all'}}>{baseUrl}/crew/{y.crew_token}</div>
                    <button onClick={() => navigator.clipboard.writeText(`${baseUrl}/crew/${y.crew_token}`)} style={{fontSize:'11px',padding:'3px 8px',background:'var(--accent)',color:'#fff',border:'none',borderRadius:'2px',cursor:'pointer',flexShrink:0}}>Copy</button>
                  </div>
                </div>

                <div style={{background:'var(--accent-light)',borderRadius:'2px',padding:'10px 12px'}}>
                  <div style={{fontSize:'11px',color:'var(--accent)',fontWeight:500,marginBottom:'6px',letterSpacing:'.06em',textTransform:'uppercase'}}>Crew Password</div>
                  {editingPassword === y.id ? (
                    <div style={{display:'flex',gap:'6px'}}>
                      <input value={newCrewPassword} onChange={e => setNewCrewPassword(e.target.value)} style={{flex:1,padding:'6px 10px',fontSize:'12px',border:'1px solid var(--border)',borderRadius:'2px',outline:'none'}}/>
                      <button onClick={() => updateCrewPassword(y.id, newCrewPassword)} style={{fontSize:'11px',padding:'4px 10px',background:'var(--accent)',color:'#fff',border:'none',borderRadius:'2px',cursor:'pointer'}}>Save</button>
                      <button onClick={() => setEditingPassword(null)} style={{fontSize:'11px',padding:'4px 10px',background:'transparent',color:'var(--muted)',border:'1px solid var(--border)',borderRadius:'2px',cursor:'pointer'}}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <div style={{fontSize:'13px',fontFamily:'monospace',color:'var(--ink)'}}>{y.crew_password || 'crew2026'}</div>
                      <button onClick={() => { setEditingPassword(y.id); setNewCrewPassword(y.crew_password || 'crew2026') }} style={{fontSize:'11px',padding:'3px 8px',background:'transparent',color:'var(--accent)',border:'1px solid var(--accent)',borderRadius:'2px',cursor:'pointer'}}>Edit</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedYacht && (
          <div className="section">
            <div className="section-label">Charters — {selectedYacht.name}</div>
            <div className="tag-row" style={{marginBottom:'16px'}}>
              <input placeholder="e.g. Smith Family — June 2026" value={newCharterName} onChange={e => setNewCharterName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createCharter()}/>
              <button className="btn-add" onClick={createCharter} disabled={creating}>+</button>
            </div>
            {charters.length === 0 ? (
              <p style={{fontSize:'13px',color:'var(--muted)'}}>No charters yet for this yacht.</p>
            ) : (
              charters.map(c => (
                <div key={c.id} style={{background:'#fff',border:'1px solid var(--border)',borderRadius:'2px',padding:'16px 20px',marginBottom:'8px'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
                    <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'18px',fontWeight:300}}>{c.name}</div>
                    <div style={{display:'flex',gap:'8px'}}>
                      {!c.active && (
                        <button onClick={() => setActive(c.id)} style={{fontSize:'11px',padding:'4px 12px',background:'transparent',color:'var(--muted)',border:'1px solid var(--border)',borderRadius:'20px',cursor:'pointer'}}>
                          Set Active
                        </button>
                      )}
                      {c.active && (
                        <>
                          <div style={{fontSize:'11px',padding:'4px 12px',background:'var(--success)',color:'#fff',borderRadius:'20px'}}>✓ Active</div>
                          <button onClick={() => endCharter(c.id)} style={{fontSize:'11px',padding:'4px 12px',background:'transparent',color:'var(--danger)',border:'1px solid var(--danger)',borderRadius:'20px',cursor:'pointer'}}>
                            End Charter
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <div style={{fontSize:'11px',color:'var(--muted)',flexShrink:0}}>Guest link:</div>
                    <div style={{fontSize:'12px',color:'var(--ink)',wordBreak:'break-all'}}>{baseUrl}/guest/{c.guest_token}</div>
                    <button onClick={() => navigator.clipboard.writeText(`${baseUrl}/guest/${c.guest_token}`)} style={{fontSize:'11px',padding:'3px 8px',background:'var(--accent)',color:'#fff',border:'none',borderRadius:'2px',cursor:'pointer',flexShrink:0}}>Copy</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </>
  )
}