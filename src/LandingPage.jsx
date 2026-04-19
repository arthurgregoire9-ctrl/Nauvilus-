import { useNavigate } from "react-router-dom"

const Logo = ({ size = 32, light = true }) => (
  <svg width={size * 6} height={size * 1.8} viewBox="0 0 300 60" xmlns="http://www.w3.org/2000/svg">
    <text x="150" y="38" textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="28" fontWeight="300" fill={light ? "#ffffff" : "#1a3a5c"} letterSpacing="8">NAUVILUS</text>
    <line x1="40" y1="46" x2="260" y2="46" stroke="#c9a96e" strokeWidth="0.8"/>
  </svg>
)

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .landing { min-height: 100vh; background: #0f2338; display: flex; flex-direction: column; }
        .landing-hero { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; }
        .landing-tagline { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 300; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 32px; margin-bottom: 80px; }
        .landing-cards { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; width: 100%; max-width: 620px; }
        .landing-card { flex: 1; min-width: 240px; max-width: 280px; border: 1px solid rgba(255,255,255,0.12); padding: 40px 32px; cursor: pointer; transition: all .3s; background: rgba(255,255,255,0.06); }
        .landing-card:hover { background: rgba(255,255,255,0.1); border-color: #c9a96e; }
        .landing-card-icon { font-size: 24px; margin-bottom: 20px; }
        .landing-card-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 300; color: #fff; margin-bottom: 12px; }
        .landing-card-desc { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 300; color: rgba(255,255,255,0.45); line-height: 1.7; letter-spacing: .04em; }
        .landing-card-arrow { font-size: 18px; color: #c9a96e; margin-top: 24px; transition: transform .3s; }
        .landing-card:hover .landing-card-arrow { transform: translateX(6px); }
        .landing-footer { padding: 32px 24px; text-align: center; font-family: 'DM Sans', sans-serif; font-size: 11px; color: rgba(255,255,255,0.2); letter-spacing: .08em; }
      `}</style>

      <div className="landing">
        <div className="landing-hero">
          <Logo size={36} light={true}/>
          <p className="landing-tagline">Guest preferences, perfected.</p>

          <div className="landing-cards">
            <div className="landing-card" onClick={() => navigate('/admin')}>
              <div className="landing-card-icon">🏢</div>
              <div className="landing-card-title">Agencies</div>
              <div className="landing-card-desc">Manage your fleet, charters and guest preference links from one place.</div>
              <div className="landing-card-arrow">→</div>
            </div>

            <div className="landing-card" onClick={() => navigate('/crew/portal')}>
              <div className="landing-card-icon">⚓</div>
              <div className="landing-card-title">Crew</div>
              <div className="landing-card-desc">Access your guest profiles and culinary tools before and during charter.</div>
              <div className="landing-card-arrow">→</div>
            </div>
          </div>
        </div>

        <div className="landing-footer">
          © 2026 Nauvilus · All rights reserved
        </div>
      </div>
    </>
  )
}