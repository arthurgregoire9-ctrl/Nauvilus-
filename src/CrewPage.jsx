import { useState, useRef, useEffect } from "react"
import { useParams } from "react-router-dom"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient("https://dmqgbxjnfkjnkpfirfdl.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcWdieGpuZmtqbmtwZmlyZmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDA0NzYsImV4cCI6MjA5MTY3NjQ3Nn0.y16FCg_HXkd7Ua_CU7K2o5Kd-QuEXxbz18hZsj4GaHI")
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY

export default function CrewPage() {
  const { token } = useParams()
  const [unlocked, setUnlocked] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [yacht, setYacht] = useState(null)
  const [activeCharter, setActiveCharter] = useState(null)
  const [allGuests, setAllGuests] = useState([])
  const [selectedGuests, setSelectedGuests] = useState([])
  const [chatHistory, setChatHistory] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const chatBoxRef = useRef(null)

  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    const savedAuth = localStorage.getItem(`crewAuth_${token}`)
    if (savedAuth === 'true') {
      setUnlocked(true)
      fetchYachtAndGuests()
    }
  }, [token])

  const unlock = async () => {
    const { data } = await supabase.from('yachts').select('crew_password').eq('crew_token', token).single()
    if (data && passwordInput === (data.crew_password || 'crew2026')) {
      localStorage.setItem(`crewAuth_${token}`, 'true')
      setUnlocked(true)
      fetchYachtAndGuests()
    } else {
      setPasswordError(true)
    }
  }

  const fetchYachtAndGuests = async () => {
    const { data: yachtData } = await supabase.from('yachts').select('*').eq('crew_token', token).single()
    if (!yachtData) return
    setYacht(yachtData)
    const { data: charterData } = await supabase.from('charters').select('*').eq('yacht_id', yachtData.id).eq('active', true).single()
    if (charterData) {
      setActiveCharter(charterData)
      const { data: guestsData } = await supabase.from('guests').select('*').eq('charter_id', charterData.id).eq('archived', false)
      if (guestsData) setAllGuests(guestsData)
    }
  }

  const toggleSelectGuest = (g) => {
    setSelectedGuests(prev => {
      const exists = prev.find(s => s.id === g.id)
      return exists ? prev.filter(s => s.id !== g.id) : [...prev, g]
    })
    setMessages([])
    setChatHistory([])
  }

  const selectAll = () => { setSelectedGuests(allGuests); setMessages([]); setChatHistory([]) }
  const clearSelection = () => { setSelectedGuests([]); setMessages([]); setChatHistory([]) }

  const buildSystem = () => {
    if (selectedGuests.length === 0) return "You are the private chef assistant aboard an ultra-luxury superyacht. No guest selected. Respond in English, be concise and professional."
    const profiles = selectedGuests.map(p => [
      "--- GUEST: " + p.name + " ---",
      p.allergies?.length ? "CRITICAL ALLERGIES: " + p.allergies.join(", ") : "",
      p.dislikes?.length  ? "Dislikes: " + p.dislikes.join(", ") : "",
      p.diets?.length     ? "Dietary requirements: " + p.diets.join(", ") : "",
      p.cuisines?.length  ? "Preferred cuisines: " + p.cuisines.join(", ") : "",
      p.favorites         ? "Favourites: " + p.favorites : "",
      p.spirits           ? "Spirits: " + p.spirits : "",
      p.cocktails         ? "Cocktails: " + p.cocktails : "",
      p.softs             ? "Soft drinks: " + p.softs : "",
      p.breakfast         ? "Breakfast preferences: " + p.breakfast : "",
      p.breakfast_time    ? "Breakfast time: " + p.breakfast_time : "",
      p.lunch_time        ? "Lunch time: " + p.lunch_time : "",
      p.dinner_time       ? "Dinner time: " + p.dinner_time : "",
      p.juices            ? "Juices: " + p.juices : "",
      p.notes             ? "Notes: " + p.notes : "",
    ].filter(Boolean).join("\n")).join("\n\n")
    return [
      "You are the private chef assistant aboard an ultra-luxury superyacht.",
      "Your role is to help the chef plan meals that work for the ENTIRE TABLE.",
      "",
      selectedGuests.length > 1
        ? "CRITICAL RULE: When multiple guests are selected, ALWAYS suggest ONE single dish that works for the whole table. Never propose different dishes per guest — a yacht chef cooks one meal for everyone. Identify the common ground between all guest profiles and build from there. If there are conflicts, suggest minor adaptations (e.g. sauce on the side, garnish omitted, alternative protein for one guest) while keeping the same core dish for all. Always flag critical allergies by guest name."
        : "Analyse the dish idea against this guest profile.",
      "",
      profiles,
      "",
      "FORMAT: Always open with [APPROVED], [NOT RECOMMENDED] or [ADJUST]. Then explain your reasoning in 3-4 sentences maximum. If multiple guests, always think in terms of one unified dish with minor individual adaptations where needed.",
    ].join("\n")
  }

  const sendMsg = async (preset) => {
    if (isLoading || selectedGuests.length === 0) return
    const text = preset || chatInput.trim()
    if (!text) return
    setChatInput('')
    const updatedHistory = [...chatHistory, { role: "user", content: text }]
    setChatHistory(updatedHistory)
    setMessages(prev => [...prev, { role: 'user', text }])
    setIsLoading(true)
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1000, system: buildSystem(), messages: updatedHistory })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const reply = (data.content || []).map(b => b.text || "").join("")
      setChatHistory(prev => [...prev, { role: "assistant", content: reply }])
      setMessages(prev => [...prev, { role: 'ai', text: reply }])
    } catch(e) {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ ' + e.message }])
    }
    setIsLoading(false)
  }

  const getVerdict = (text) => {
    if (text.includes('[APPROVED]')) return { cls: 'green', label: '✅ Approved' }
    if (text.includes('[NOT RECOMMENDED]')) return { cls: 'red', label: '❌ Not Recommended' }
    if (text.includes('[ADJUST]')) return { cls: 'yellow', label: '⚠️ Adjust' }
    return null
  }

 const cleanText = (text) => {
  return text
    .replace(/\[APPROVED\]|\[NOT RECOMMENDED\]|\[ADJUST\]/g, '')
    .replace(/^### (.+)$/gm, '<h4 style="font-family:Cormorant Garamond,serif;font-size:18px;font-weight:400;margin:20px 0 8px;color:#1a3a5c;">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="font-family:Cormorant Garamond,serif;font-size:20px;font-weight:400;margin:24px 0 10px;color:#1a3a5c;border-bottom:1px solid #e8e0d5;padding-bottom:6px;">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="font-family:Cormorant Garamond,serif;font-size:24px;font-weight:300;margin:28px 0 12px;color:#1a3a5c;">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<div style="display:flex;gap:10px;margin:4px 0;"><span style="color:#1a3a5c;flex-shrink:0;">—</span><span>$1</span></div>')
    .replace(/^• (.+)$/gm, '<div style="display:flex;gap:10px;margin:4px 0;"><span style="color:#1a3a5c;flex-shrink:0;">—</span><span>$1</span></div>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e8e0d5;margin:16px 0;"/>')
    .replace(/\n\n/g, '<div style="margin-top:12px;"></div>')
    .trim()
}
  if (!unlocked) {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
        <nav><div className="brand">The Galley</div></nav>
        <main style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}>
          <div style={{width:'100%',maxWidth:'360px'}}>
            <div className="page-header" style={{textAlign:'center'}}>
              <h1>Crew <em>Access</em></h1>
              <p>Enter your crew password to continue.</p>
            </div>
            <div className="field" style={{marginTop:'32px'}}>
              <label>Password</label>
              <input type="password" placeholder="Enter crew password" value={passwordInput} onChange={e => { setPasswordInput(e.target.value); setPasswordError(false) }} onKeyDown={e => e.key === 'Enter' && unlock()} style={{borderColor: passwordError ? 'var(--danger)' : undefined}}/>
              {passwordError && <p style={{fontSize:'12px',color:'var(--danger)',marginTop:'6px'}}>Incorrect password. Please try again.</p>}
            </div>
            <button className="btn-primary" onClick={unlock}>Access Crew Dashboard</button>
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
        {yacht && <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',letterSpacing:'.08em'}}>{yacht.name}{activeCharter ? ' · ' + activeCharter.name : ''}</span>}
      </nav>

      <main>
        <div className="page-header">
          <h1>Chef <em>Assistant</em></h1>
          <p>{activeCharter ? `Active charter: ${activeCharter.name}` : 'No active charter. Please set one active in the agency dashboard.'}</p>
        </div>

        {!activeCharter ? (
          <div style={{textAlign:'center',padding:'60px 0',color:'var(--muted)'}}>
            <div style={{fontSize:'32px',marginBottom:'16px'}}>⚓</div>
            <p>No active charter found.<br/>Ask your agency to set a charter as active.</p>
          </div>
        ) : (
          <div className="crew-wrap">
            <div className="guest-card">
              <h3>Guest Profiles</h3>
              {allGuests.length > 0 && (
                <div style={{display:'flex',gap:'6px',marginBottom:'12px'}}>
                  <button onClick={selectAll} style={{flex:1,padding:'6px',fontSize:'11px',letterSpacing:'.06em',textTransform:'uppercase',background:'var(--accent)',color:'#fff',border:'none',borderRadius:'2px',cursor:'pointer'}}>Select All</button>
                  <button onClick={clearSelection} style={{flex:1,padding:'6px',fontSize:'11px',letterSpacing:'.06em',textTransform:'uppercase',background:'transparent',color:'var(--muted)',border:'1px solid var(--border)',borderRadius:'2px',cursor:'pointer'}}>Clear</button>
                </div>
              )}
              {allGuests.length === 0 ? (
                <div className="no-guest">
                  <div className="ico">👤</div>
                  <p>No guest profiles yet for this charter.</p>
                </div>
              ) : (
                allGuests.map(g => {
                  const isSelected = selectedGuests.find(s => s.id === g.id)
                  return (
                    <div key={g.id} onClick={() => toggleSelectGuest(g)} style={{padding:'10px 12px',marginBottom:'6px',cursor:'pointer',borderRadius:'2px',border:`1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,background: isSelected ? 'var(--accent)' : '#fff',color: isSelected ? '#fff' : 'var(--ink)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <div style={{width:'16px',height:'16px',borderRadius:'3px',border:`1px solid ${isSelected ? '#fff' : 'var(--border)'}`,background: isSelected ? '#fff' : 'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          {isSelected && <span style={{color:'var(--accent)',fontSize:'12px',fontWeight:'bold'}}>✓</span>}
                        </div>
                        <div>
                          <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'16px'}}>{g.name}</div>
                          {g.allergies?.length > 0 && <div style={{fontSize:'11px',color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--danger)',marginTop:'4px'}}>⚠️ {g.allergies.join(', ')}</div>}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="chat-panel">
              <div className="chat-msgs" ref={chatBoxRef}>
                {messages.length === 0 && (
                  <div className="chat-welcome">
                    <div className="ico">🍽️</div>
                    <h3>Good evening, Chef</h3>
                    <p>{selectedGuests.length > 0 ? `Analysing for ${selectedGuests.length} guest${selectedGuests.length > 1 ? 's' : ''}. Propose a dish.` : 'Select one or more guest profiles to begin.'}</p>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const verdict = msg.role==='ai' ? getVerdict(msg.text) : null
                  return (
                    <div key={i} className={`msg ${msg.role}`}>
                      <div className="avatar">{msg.role==='user' ? '👨‍🍳' : '🤖'}</div>
                      <div className="bubble">
                        {verdict && <div className={`verdict ${verdict.cls}`}>{verdict.label}</div>}
                      <div dangerouslySetInnerHTML={{__html: msg.role==='ai' ? cleanText(msg.text) : msg.text}}/> 
                      </div>
                    </div>
                  )
                })}
                {isLoading && (
                  <div className="msg ai">
                    <div className="avatar">🤖</div>
                    <div className="bubble"><div className="typing"><span></span><span></span><span></span></div></div>
                  </div>
                )}
              </div>
              <div className="chat-input-row">
                <input placeholder="e.g. Tuna tartare with avocado as a starter?" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==='Enter' && sendMsg()} disabled={selectedGuests.length === 0}/>
                <button className="send-btn" disabled={isLoading || selectedGuests.length === 0} onClick={() => sendMsg()}>↑</button>
              </div>
              <div className="suggestions">
                {["Tuna tartare with avocado?","Truffle risotto tonight?","Cheese selection for dessert?","Prime rib for tomorrow?"].map(s => (
                  <button key={s} className="sug" onClick={() => sendMsg(s)} disabled={selectedGuests.length === 0}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}