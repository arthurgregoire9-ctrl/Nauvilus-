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
      "GUEST: " + p.name,
      p.allergies?.length ? "⚠️ ALLERGIES (life-threatening): " + p.allergies.join(", ") : "",
      p.dislikes?.length  ? "🚫 NEVER USE (zero tolerance — not even as garnish, sauce, or trace): " + p.dislikes.join(", ") : "",
      p.diets?.length     ? "Diet: " + p.diets.join(", ") : "",
      p.cuisines?.length  ? "Loves: " + p.cuisines.join(", ") : "",
      p.favorites         ? "Favourites: " + p.favorites : "",
      p.spirits           ? "Spirits: " + p.spirits : "",
      p.cocktails         ? "Cocktails: " + p.cocktails : "",
      p.softs             ? "Softs: " + p.softs : "",
      p.breakfast         ? "Breakfast prefs: " + p.breakfast : "",
      p.breakfast_time    ? "Breakfast time: " + p.breakfast_time : "",
      p.lunch_time        ? "Lunch time: " + p.lunch_time : "",
      p.dinner_time       ? "Dinner time: " + p.dinner_time : "",
      p.juices            ? "Juices: " + p.juices : "",
      p.notes             ? "Notes: " + p.notes : "",
    ].filter(Boolean).join(" | ")).join("\n")

    return [
      "You are a private chef assistant aboard an ultra-luxury superyacht.",
      "",
      "GUEST PROFILES:",
      profiles,
      "",
      "YOUR MISSION:",
      "Help the chef plan meals. When asked about a dish, validate it. When asked for a menu or shopping list, generate it fully.",
      "",
      "ABSOLUTE RULES — NEVER BREAK:",
      "1. Allergies = life-threatening. Zero tolerance.",
      "2. Dislikes = same strictness as allergies. Never include, even in sauce, garnish, or trace.",
      "3. Always mentally check EVERY ingredient of EVERY dish against EVERY guest's forbidden list before responding.",
      "",
      "DISH COHERENCE RULES (most important):",
      "- ONE dish name for the whole table. The dish must be IDENTICAL for all guests.",
      "- Only MINOR adaptations per guest: remove a topping, sauce on the side, swap a protein.",
      "- NEVER create a completely different dish for one guest.",
      "- GOOD EXAMPLE: Base = Truffle risotto. Charlotte → same risotto, no parmesan. Chloé → same risotto, extra mushrooms instead of chicken.",
      "- BAD EXAMPLE: 'For Chloé, a green salad instead.' — This is WRONG. The dish must remain a risotto for everyone.",
      "- If a guest is vegetarian, find a dish that is naturally vegetarian or easily made so — do not give them a separate dish.",
      "- If a dish truly cannot work for one guest even with minor adaptations, say so clearly and suggest a different base dish for everyone.",
      "",
      "SHOPPING LIST RULES:",
      "- When asked for a shopping list, generate a complete, organised list by category.",
      "- Include exact quantities based on number of guests and days.",
      "- Respect all forbidden ingredients — never include them in the shopping list.",
      "- Categories: Proteins, Vegetables & Fruits, Dairy, Dry Goods, Beverages & Spirits, Herbs & Spices, Condiments.",
      "",
      "RESPONSE FORMAT for dish validation (mandatory):",
      "1. [APPROVED] / [NOT RECOMMENDED] / [ADJUST]",
      "2. Dish name — one line",
      "3. One line per guest: '✓ Arthur — no changes' or '✓ Charlotte — dressing on the side'",
      "4. One sentence of explanation maximum",
      "",
      "CULINARY STANDARDS:",
"- All dishes must be refined, elegant and worthy of a Michelin-starred restaurant.",
"- Superyacht guests expect the highest gastronomic standards. No simple or basic dishes.",
"- Prioritise premium ingredients: truffle, wagyu, langoustine, foie gras, caviar, premium fish.",
"- Presentations must be restaurant-quality. Always think plating and visual elegance.",
"- Inspiration from French, Japanese, Mediterranean haute cuisine.",
"- When generating a week menu, ensure variety and progression — no repeated dishes, balanced between land and sea.",
      "Keep responses SHORT and easy to read. The chef reads this in 5 seconds between two pans.",
    ].join("\n")
  }

  const cleanText = (text) => {
    return text
      .replace(/\[APPROVED\]|\[NOT RECOMMENDED\]|\[ADJUST\]/g, '')
      .replace(/\|.+\|/g, '')
      .replace(/^#{1,3} (.+)$/gm, '<div style="font-family:Cormorant Garamond,serif;font-size:18px;font-weight:500;margin:16px 0 6px;color:#1a3a5c;">$1</div>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^[-•] (.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0;"><span style="color:#1a3a5c;flex-shrink:0;">—</span><span>$1</span></div>')
      .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e8e0d5;margin:12px 0;"/>')
      .replace(/\n\n/g, '<div style="margin-top:10px;"></div>')
      .replace(/\n/g, '<br/>')
      .trim()
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
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 4000, system: buildSystem(), messages: updatedHistory })
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
                          {g.dislikes?.length > 0 && <div style={{fontSize:'11px',color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--muted)',marginTop:'2px'}}>🚫 {g.dislikes.join(', ')}</div>}
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
                    <p>{selectedGuests.length > 0 ? `Analysing for ${selectedGuests.length} guest${selectedGuests.length > 1 ? 's' : ''}. Propose a dish or ask for a menu.` : 'Select one or more guest profiles to begin.'}</p>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const verdict = msg.role==='ai' ? getVerdict(msg.text) : null
                  return (
                    <div key={i} className={`msg ${msg.role}`}>
                      <div className="avatar">{msg.role==='user' ? '👨‍🍳' : '🤖'}</div>
                      <div className="bubble">
                        {verdict && <div className={`verdict ${verdict.cls}`}>{verdict.label}</div>}
                        {msg.role==='ai'
                          ? <div dangerouslySetInnerHTML={{__html: cleanText(msg.text)}}/>
                          : <div>{msg.text}</div>
                        }
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
                <input placeholder="e.g. Truffle risotto tonight?" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==='Enter' && sendMsg()} disabled={selectedGuests.length === 0}/>
                <button className="send-btn" disabled={isLoading || selectedGuests.length === 0} onClick={() => sendMsg()}>↑</button>
              </div>
              <div className="suggestions">
                {["Truffle risotto tonight?","Full week menu plan?","Shopping list for 7 days?","Dessert ideas?"].map(s => (
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