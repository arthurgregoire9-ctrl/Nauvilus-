import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient("https://dmqgbxjnfkjnkpfirfdl.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcWdieGpuZmtqbmtwZmlyZmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDA0NzYsImV4cCI6MjA5MTY3NjQ3Nn0.y16FCg_HXkd7Ua_CU7K2o5Kd-QuEXxbz18hZsj4GaHI")

const SUPER_PASSWORD = "arthur"

export default function SuperAdminPage() {
  const [unlocked, setUnlocked] = useState(localStorage.getItem('superAuth') === 'true')
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [agencies, setAgencies] = useState([])
  const [newAgency, setNewAgency] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (unlocked) fetchAgencies()
  }, [unlocked])

  const unlock = () => {
    if (passwordInput === SUPER_PASSWORD) {
      localStorage.setItem('superAuth', 'true')
      setUnlocked(true)
    } else {
      setPasswordError(true)
    }
  }

  const fetchAgencies = async () => {
    const { data } = await supabase.from('admins').select('id, agency, password, created_at').order('created_at', { ascending: false })
    if (data) setAgencies(data)
  }

  const createAgency = async () => {
    if (!newAgency.trim() || !newPassword.trim()) return
    setCreating(true)
    await supabase.from('admins').insert({ agency: newAgency.trim(), password: newPassword.trim() })
    setNewAgency('')
    setNewPassword('')
    setSuccess('Agency created successfully!')
    setTimeout(() => setSuccess(''), 3000)
    await fetchAgencies()
    setCreating(false)
  }

  const deleteAgency = async (id, agencyName) => {
    if (!window.confirm(`Delete ${agencyName}? Their yachts will be unlinked but not deleted.`)) return
    await supabase.from('yachts').update({ agency_id: null }).eq('agency_id', id)
    await supabase.from('admins').delete().eq('id', id)
    await fetchAgencies()
  }

  const updatePassword = async (id, newPwd) => {
    await supabase.from('admins').update({ password: newPwd }).eq('id', id)
    setSuccess('Password updated!')
    setTimeout(() => setSuccess(''), 3000)
    await fetchAgencies()
  }

  if (!unlocked) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
        <nav><div className="brand">The Galley</div></nav>
        <main style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}>
          <div style={{width:'100%',maxWidth:'360px'}}>
            <div className="page-header" style={{textAlign:'center'}}>
              <h1>Super <em>Admin</em></h1>
              <p>Restricted access. Enter your password to continue.</p>
            </div>
            <div className="field" style={{marginTop:'32px'}}>
              <label>Password</label>
              <input type="password" placeholder="Enter super admin password" value={passwordInput} onChange={e => { setPasswordInput(e.target.value); setPasswordError(false) }} onKeyDown={e => e.key === 'Enter' && unlock()} style={{borderColor: passwordError ? 'var(--danger)' : undefined}}/>
              {passwordError && <p style={{fontSize:'12px',color:'var(--danger)',marginTop:'6px'}}>Incorrect password.</p>}
            </div>
            <button className="btn-primary" onClick={unlock}>Access Super Admin</button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <nav>
        <div className="brand">The Galley</div>
        <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',letterSpacing:'.08em'}}>Super Admin</div>
      </nav>
      <main>
        <div className="page-header">
          <h1>Agency <em>Management</em></h1>
          <p>Create and manage all charter agencies.</p>
        </div>

        {success && (
          <div style={{background:'#eaf3ed',border:'1px solid #bcdbc8',borderRadius:'2px',padding:'12px 16px',marginBottom:'24px',fontSize:'13px',color:'var(--success)'}}>
            ✓ {success}
          </div>
        )}

        <div className="section">
          <div className="section-label">Create New Agency</div>
          <div className="field">
            <label>Agency Name</label>
            <input placeholder="e.g. Monaco Yachting" value={newAgency} onChange={e => setNewAgency(e.target.value)}/>
          </div>
          <div className="field">
            <label>Password</label>
            <input placeholder="e.g. monaco2026" value={newPassword} onChange={e => setNewPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && createAgency()}/>
          </div>
          <button className="btn-primary" onClick={createAgency} disabled={creating}>
            {creating ? 'Creating...' : 'Create Agency'}
          </button>
        </div>

        <div className="section">
          <div className="section-label">All Agencies</div>
          {agencies.length === 0 ? (
            <p style={{fontSize:'13px',color:'var(--muted)'}}>No agencies yet.</p>
          ) : (
            agencies.map(a => (
              <AgencyRow key={a.id} agency={a} onDelete={deleteAgency} onUpdatePassword={updatePassword}/>
            ))
          )}
        </div>
      </main>
    </>
  )
}

function AgencyRow({ agency, onDelete, onUpdatePassword }) {
  const [editing, setEditing] = useState(false)
  const [newPwd, setNewPwd] = useState(agency.password)

  return (
    <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:'2px',padding:'16px 20px',marginBottom:'8px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
        <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'20px',fontWeight:300}}>{agency.agency}</div>
        <button onClick={() => onDelete(agency.id, agency.agency)} style={{fontSize:'11px',padding:'3px 10px',background:'transparent',color:'var(--danger)',border:'1px solid var(--danger)',borderRadius:'2px',cursor:'pointer'}}>Delete</button>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
        <div style={{fontSize:'11px',color:'var(--muted)',flexShrink:0}}>Password:</div>
        {editing ? (
          <>
            <input value={newPwd} onChange={e => setNewPwd(e.target.value)} style={{flex:1,padding:'4px 8px',fontSize:'12px',border:'1px solid var(--border)',borderRadius:'2px',outline:'none'}}/>
            <button onClick={() => { onUpdatePassword(agency.id, newPwd); setEditing(false) }} style={{fontSize:'11px',padding:'3px 8px',background:'var(--accent)',color:'#fff',border:'none',borderRadius:'2px',cursor:'pointer'}}>Save</button>
            <button onClick={() => setEditing(false)} style={{fontSize:'11px',padding:'3px 8px',background:'transparent',color:'var(--muted)',border:'1px solid var(--border)',borderRadius:'2px',cursor:'pointer'}}>Cancel</button>
          </>
        ) : (
          <>
            <div style={{fontSize:'12px',color:'var(--ink)',fontFamily:'monospace'}}>{agency.password}</div>
            <button onClick={() => setEditing(true)} style={{fontSize:'11px',padding:'3px 8px',background:'transparent',color:'var(--accent)',border:'1px solid var(--accent)',borderRadius:'2px',cursor:'pointer'}}>Edit</button>
          </>
        )}
      </div>
      <div style={{fontSize:'11px',color:'var(--muted)',marginTop:'6px'}}>
        Created: {new Date(agency.created_at).toLocaleDateString()}
      </div>
    </div>
  )
}