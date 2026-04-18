import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient("https://dmqgbxjnfkjnkpfirfdl.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcWdieGpuZmtqbmtwZmlyZmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDA0NzYsImV4cCI6MjA5MTY3NjQ3Nn0.y16FCg_HXkd7Ua_CU7K2o5Kd-QuEXxbz18hZsj4GaHI")

const TRANSLATIONS = {
  en: {
    flag: '🇬🇧',
    title: 'Your', titleItalic: 'culinary', titleEnd: 'preferences',
    subtitle: 'This information allows our private chef to personalise every dining experience exclusively for you.',
    steps: ['Profile', 'Restrictions', 'Tastes', 'Dining'],
    returning: 'Returning guest?',
    emailPlaceholder: 'Enter your email to retrieve your profile',
    profileFound: '✓ Profile found — your preferences have been loaded.',
    profileNotFound: 'No profile found. Please fill in your preferences below.',
    firstName: 'First name', firstNamePlaceholder: 'e.g. Alexandra',
    email: 'Email', emailSub: 'Used to save and retrieve your profile',
    emailInputPlaceholder: 'e.g. alexandra@email.com',
    allergies: 'Allergies & Intolerances', allergiesPlaceholder: 'e.g. Nuts, Shellfish, Lactose',
    dislikes: 'Disliked Ingredients', dislikesPlaceholder: 'e.g. Coriander, Liver, Pineapple',
    dietary: 'Dietary Requirements', cuisines: 'Preferred Cuisines',
    favorites: 'Favourite Dishes & Flavours', favoritesPlaceholder: 'e.g. Fresh sashimi, hand-made pasta, black truffle',
    spirits: 'Favourite Spirits', spiritsPlaceholder: 'e.g. Macallan 18, Grey Goose, Don Julio 1942',
    cocktails: 'Favourite Cocktails', cocktailsPlaceholder: 'e.g. Negroni, Mojito, Aperol Spritz',
    softs: 'Soft Drinks', softsPlaceholder: 'e.g. San Pellegrino, Fever-Tree Ginger Beer',
    mealTimes: 'Preferred Meal Times',
    breakfastTime: 'Breakfast',
    lunchTime: 'Lunch',
    dinnerTime: 'Dinner',
    breakfast: 'Breakfast Preferences', breakfastPlaceholder: 'e.g. Eggs Benedict, fresh fruit, granola',
    juices: 'Favourite Juices', juicesPlaceholder: 'e.g. Fresh orange, green juice, watermelon',
    notes: 'Additional Notes', notesPlaceholder: 'e.g. Lighter meals at lunch, no red meat in the evening',
    next: 'Continue', back: 'Back', submit: 'Submit to the crew',
    thankYou: 'Thank you.',
    thankYouMsg: 'Your preferences have been saved and transmitted to the crew. Our private chef will ensure every meal is tailored to your taste throughout your time on board.',
    addGuest: '+ Add guest', notFound: 'Link not found',
    notFoundMsg: 'Please contact your charter agency for a valid link.',
    loading: 'Loading...',
    diets: ["Vegan","Vegetarian","Halal","Kosher","Keto","Gluten-free","Lactose-free","Paleo","No Pork"],
    cuisineList: ["Japanese","Italian","French","Mediterranean","Asian","American","Mexican","Indian","Greek","Levantine"],
  },
  fr: {
    flag: '🇫🇷',
    title: 'Vos', titleItalic: 'préférences', titleEnd: 'culinaires',
    subtitle: 'Ces informations permettent à notre chef privé de personnaliser chaque repas exclusivement pour vous.',
    steps: ['Profil', 'Restrictions', 'Goûts', 'Repas'],
    returning: 'Déjà client ?',
    emailPlaceholder: 'Entrez votre email pour retrouver votre profil',
    profileFound: '✓ Profil trouvé — vos préférences ont été chargées.',
    profileNotFound: 'Aucun profil trouvé. Veuillez remplir vos préférences ci-dessous.',
    firstName: 'Prénom', firstNamePlaceholder: 'ex. Alexandra',
    email: 'Email', emailSub: 'Utilisé pour sauvegarder et retrouver votre profil',
    emailInputPlaceholder: 'ex. alexandra@email.com',
    allergies: 'Allergies & intolérances', allergiesPlaceholder: 'ex. Noix, Crustacés, Lactose',
    dislikes: 'Aliments détestés', dislikesPlaceholder: 'ex. Coriandre, Foie, Ananas',
    dietary: 'Régimes alimentaires', cuisines: 'Cuisines préférées',
    favorites: 'Plats & saveurs favoris', favoritesPlaceholder: 'ex. Sushis frais, pâtes fraîches, truffe noire',
    spirits: 'Alcools forts préférés', spiritsPlaceholder: 'ex. Macallan 18, Grey Goose, Don Julio 1942',
    cocktails: 'Cocktails préférés', cocktailsPlaceholder: 'ex. Negroni, Mojito, Aperol Spritz',
    softs: 'Boissons sans alcool', softsPlaceholder: 'ex. San Pellegrino, Fever-Tree Ginger Beer',
    mealTimes: 'Horaires des repas',
    breakfastTime: 'Petit-déjeuner',
    lunchTime: 'Déjeuner',
    dinnerTime: 'Dîner',
    breakfast: 'Préférences petit-déjeuner', breakfastPlaceholder: 'ex. Oeufs Benedict, fruits frais, granola',
    juices: 'Jus préférés', juicesPlaceholder: 'ex. Orange pressée, jus vert, pastèque',
    notes: 'Notes supplémentaires', notesPlaceholder: 'ex. Repas légers le midi, pas de viande rouge le soir',
    next: 'Continuer', back: 'Retour', submit: 'Envoyer à l equipage',
    thankYou: 'Merci.',
    thankYouMsg: 'Vos préférences ont été sauvegardées et transmises à l equipage.',
    addGuest: '+ Ajouter un invité', notFound: 'Lien introuvable',
    notFoundMsg: 'Veuillez contacter votre agence de charter pour obtenir un lien valide.',
    loading: 'Chargement...',
    diets: ["Vegan","Végétarien","Halal","Casher","Keto","Sans gluten","Sans lactose","Paleo","Sans porc"],
    cuisineList: ["Japonaise","Italienne","Française","Méditerranéenne","Asiatique","Américaine","Mexicaine","Indienne","Grecque","Levantine"],
  },
  it: {
    flag: '🇮🇹',
    title: 'Le tue', titleItalic: 'preferenze', titleEnd: 'culinarie',
    subtitle: 'Queste informazioni permettono al nostro chef privato di personalizzare ogni esperienza culinaria esclusivamente per te.',
    steps: ['Profilo', 'Restrizioni', 'Gusti', 'Pasti'],
    returning: 'Già cliente?',
    emailPlaceholder: 'Inserisci la tua email per recuperare il tuo profilo',
    profileFound: '✓ Profilo trovato — le tue preferenze sono state caricate.',
    profileNotFound: 'Nessun profilo trovato. Compila le tue preferenze qui sotto.',
    firstName: 'Nome', firstNamePlaceholder: 'es. Alexandra',
    email: 'Email', emailSub: 'Usata per salvare e recuperare il tuo profilo',
    emailInputPlaceholder: 'es. alexandra@email.com',
    allergies: 'Allergie & intolleranze', allergiesPlaceholder: 'es. Noci, Crostacei, Lattosio',
    dislikes: 'Ingredienti non graditi', dislikesPlaceholder: 'es. Coriandolo, Fegato, Ananas',
    dietary: 'Requisiti dietetici', cuisines: 'Cucine preferite',
    favorites: 'Piatti & sapori preferiti', favoritesPlaceholder: 'es. Sashimi fresco, pasta fatta in casa, tartufo nero',
    spirits: 'Superalcolici preferiti', spiritsPlaceholder: 'es. Macallan 18, Grey Goose, Don Julio 1942',
    cocktails: 'Cocktail preferiti', cocktailsPlaceholder: 'es. Negroni, Mojito, Aperol Spritz',
    softs: 'Bevande analcoliche', softsPlaceholder: 'es. San Pellegrino, Fever-Tree Ginger Beer',
    mealTimes: 'Orari dei pasti preferiti',
    breakfastTime: 'Colazione',
    lunchTime: 'Pranzo',
    dinnerTime: 'Cena',
    breakfast: 'Preferenze colazione', breakfastPlaceholder: 'es. Uova Benedict, frutta fresca, granola',
    juices: 'Succhi preferiti', juicesPlaceholder: 'es. Arancia fresca, succo verde, anguria',
    notes: 'Note aggiuntive', notesPlaceholder: 'es. Pasti leggeri a pranzo, niente carne rossa la sera',
    next: 'Continua', back: 'Indietro', submit: 'Invia all equipaggio',
    thankYou: 'Grazie.',
    thankYouMsg: 'Le tue preferenze sono state salvate e trasmesse all equipaggio.',
    addGuest: '+ Aggiungi ospite', notFound: 'Link non trovato',
    notFoundMsg: 'Contatta la tua agenzia charter per ottenere un link valido.',
    loading: 'Caricamento...',
    diets: ["Vegano","Vegetariano","Halal","Kosher","Keto","Senza glutine","Senza lattosio","Paleo","Senza maiale"],
    cuisineList: ["Giapponese","Italiana","Francese","Mediterranea","Asiatica","Americana","Messicana","Indiana","Greca","Levantina"],
  },
  ru: {
    flag: '🇷🇺',
    title: 'Ваши', titleItalic: 'кулинарные', titleEnd: 'предпочтения',
    subtitle: 'Эта информация позволяет нашему личному шеф-повару персонализировать каждый приём пищи исключительно для вас.',
    steps: ['Профиль', 'Ограничения', 'Вкусы', 'Питание'],
    returning: 'Уже были у нас?',
    emailPlaceholder: 'Введите email для загрузки вашего профиля',
    profileFound: '✓ Профиль найден — ваши предпочтения загружены.',
    profileNotFound: 'Профиль не найден. Заполните предпочтения ниже.',
    firstName: 'Имя', firstNamePlaceholder: 'напр. Александра',
    email: 'Email', emailSub: 'Для сохранения и получения вашего профиля',
    emailInputPlaceholder: 'напр. alexandra@email.com',
    allergies: 'Аллергии & непереносимости', allergiesPlaceholder: 'напр. Орехи, Морепродукты, Лактоза',
    dislikes: 'Нежелательные ингредиенты', dislikesPlaceholder: 'напр. Кинза, Печень, Ананас',
    dietary: 'Диетические требования', cuisines: 'Предпочитаемые кухни',
    favorites: 'Любимые блюда & вкусы', favoritesPlaceholder: 'напр. Свежее сашими, домашняя паста, чёрный трюфель',
    spirits: 'Крепкие напитки', spiritsPlaceholder: 'напр. Macallan 18, Grey Goose, Don Julio 1942',
    cocktails: 'Любимые коктейли', cocktailsPlaceholder: 'напр. Негрони, Мохито, Апероль Шприц',
    softs: 'Безалкогольные напитки', softsPlaceholder: 'напр. San Pellegrino, Fever-Tree Ginger Beer',
    mealTimes: 'Предпочтительное время приёма пищи',
    breakfastTime: 'Завтрак',
    lunchTime: 'Обед',
    dinnerTime: 'Ужин',
    breakfast: 'Предпочтения по завтраку', breakfastPlaceholder: 'напр. Яйца Бенедикт, свежие фрукты, гранола',
    juices: 'Любимые соки', juicesPlaceholder: 'напр. Свежий апельсин, зелёный сок, арбуз',
    notes: 'Дополнительные заметки', notesPlaceholder: 'напр. Лёгкие блюда на обед, без красного мяса вечером',
    next: 'Продолжить', back: 'Назад', submit: 'Отправить экипажу',
    thankYou: 'Спасибо.',
    thankYouMsg: 'Ваши предпочтения сохранены и переданы экипажу.',
    addGuest: '+ Добавить гостя', notFound: 'Ссылка не найдена',
    notFoundMsg: 'Свяжитесь с вашим агентством для получения действительной ссылки.',
    loading: 'Загрузка...',
    diets: ["Веган","Вегетарианец","Халяль","Кошер","Кето","Без глютена","Без лактозы","Палео","Без свинины"],
    cuisineList: ["Японская","Итальянская","Французская","Средиземноморская","Азиатская","Американская","Мексиканская","Индийская","Греческая","Левантийская"],
  }
}

const emptyGuest = () => ({ name:'', email:'', allergies:[], dislikes:[], diets:[], cuisines:[], favorites:'', spirits:'', cocktails:'', softs:'', breakfast:'', juices:'', notes:'', breakfast_time:'08:00', lunch_time:'13:00', dinner_time:'20:00' })

function TimeSelector({ label, value, onChange }) {
  const hours = Array.from({length: 24}, (_, i) => i)
  const minutes = ['00', '15', '30', '45']
  const [hour, setHour] = useState(value ? parseInt(value.split(':')[0]) : 8)
  const [minute, setMinute] = useState(value ? value.split(':')[1] : '00')

  const update = (h, m) => onChange(`${String(h).padStart(2,'0')}:${m}`)

  return (
    <div style={{marginBottom:'16px'}}>
      <div style={{fontSize:'10px',fontWeight:'500',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--muted)',marginBottom:'8px'}}>{label}</div>
      <div style={{display:'flex',alignItems:'center',gap:'4px',background:'#fff',border:'1px solid var(--border)',borderRadius:'2px',padding:'10px 16px',width:'fit-content'}}>
        <select value={hour} onChange={e => { const h=parseInt(e.target.value); setHour(h); update(h,minute) }} style={{border:'none',outline:'none',fontSize:'28px',fontFamily:'Cormorant Garamond,serif',fontWeight:300,color:'var(--ink)',background:'transparent',cursor:'pointer',WebkitAppearance:'none',appearance:'none',textAlign:'center',width:'52px'}}>
          {hours.map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}</option>)}
        </select>
        <span style={{fontSize:'28px',fontFamily:'Cormorant Garamond,serif',color:'var(--muted)',margin:'0 2px'}}>:</span>
        <select value={minute} onChange={e => { const m=e.target.value; setMinute(m); update(hour,m) }} style={{border:'none',outline:'none',fontSize:'28px',fontFamily:'Cormorant Garamond,serif',fontWeight:300,color:'var(--ink)',background:'transparent',cursor:'pointer',WebkitAppearance:'none',appearance:'none',textAlign:'center',width:'52px'}}>
          {minutes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <span style={{fontSize:'13px',color:'var(--muted)',marginLeft:'10px',fontWeight:500}}>{hour < 12 ? 'AM' : 'PM'}</span>
      </div>
    </div>
  )
}

function StepIndicator({ current, total, labels }) {
  return (
    <div style={{marginBottom:'48px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0',marginBottom:'12px'}}>
        {Array.from({length: total}).map((_, i) => (
          <div key={i} style={{display:'flex',alignItems:'center'}}>
            <div style={{width:'28px',height:'28px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:'600',background: i < current ? 'var(--accent)' : i === current ? 'var(--ink)' : 'transparent',color: i <= current ? '#fff' : 'var(--muted)',border: i > current ? '1px solid var(--border)' : 'none',transition:'all .3s'}}>
              {i < current ? '✓' : i + 1}
            </div>
            {i < total - 1 && <div style={{width:'48px',height:'1px',background: i < current ? 'var(--accent)' : 'var(--border)',transition:'all .3s'}}/>}
          </div>
        ))}
      </div>
      <div style={{textAlign:'center',fontSize:'11px',fontWeight:'500',letterSpacing:'.12em',textTransform:'uppercase',color:'var(--muted)'}}>
        {labels[current]}
      </div>
    </div>
  )
}

function TagInput({ placeholder, tags, onAdd, onRemove, className }) {
  const [input, setInput] = useState('')
  return (
    <div>
      <div className="tag-row">
        <input placeholder={placeholder} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key==='Enter') { const v=input.trim(); if(v && !tags.includes(v)) onAdd(v); setInput('') }}}/>
        <button className="btn-add" onClick={() => { const v=input.trim(); if(v && !tags.includes(v)) onAdd(v); setInput('') }}>+</button>
      </div>
      <div className="tags" style={{marginTop:'10px'}}>
        {tags.map(v => <span key={v} className={`tag ${className||''}`}>{v}<button onClick={() => onRemove(v)}>×</button></span>)}
      </div>
    </div>
  )
}

function GuestForm({ guest, onChange, t, onSubmit, step, setStep }) {
  const [emailLookup, setEmailLookup] = useState('')
  const [lookupStatus, setLookupStatus] = useState('')

  const lookupGuest = async () => {
    if (!emailLookup.trim()) return
    setLookupStatus('searching')
    const { data } = await supabase.from('guests').select('*').eq('email', emailLookup.trim().toLowerCase()).single()
    if (data) { onChange({ ...data }); setLookupStatus('found') }
    else setLookupStatus('notfound')
  }

  const toggleChip = (type, item) => {
    if (type === 'diet') onChange({ ...guest, diets: guest.diets.includes(item) ? guest.diets.filter(d => d !== item) : [...guest.diets, item] })
    else onChange({ ...guest, cuisines: guest.cuisines.includes(item) ? guest.cuisines.filter(c => c !== item) : [...guest.cuisines, item] })
  }

  const steps = [
    <div key="s1" style={{animation:'fadeSlide .4s ease'}}>
      <div className="section">
        <div className="section-label">{t.returning}</div>
        <div className="tag-row">
          <input placeholder={t.emailPlaceholder} value={emailLookup} onChange={e => setEmailLookup(e.target.value)} onKeyDown={e => e.key==='Enter' && lookupGuest()}/>
          <button className="btn-add" onClick={lookupGuest}>→</button>
        </div>
        {lookupStatus === 'found' && <p style={{fontSize:'13px',color:'var(--success)',marginTop:'8px'}}>{t.profileFound}</p>}
        {lookupStatus === 'notfound' && <p style={{fontSize:'13px',color:'var(--muted)',marginTop:'8px'}}>{t.profileNotFound}</p>}
      </div>
      <div className="section">
        <div className="field">
          <label>{t.firstName}</label>
          <input placeholder={t.firstNamePlaceholder} value={guest.name} onChange={e => onChange({ ...guest, name: e.target.value })}/>
        </div>
        <div className="field">
          <label>{t.email} <span style={{fontWeight:300,color:'var(--muted)',fontSize:'12px'}}>— {t.emailSub}</span></label>
          <input type="email" placeholder={t.emailInputPlaceholder} value={guest.email} onChange={e => onChange({ ...guest, email: e.target.value })}/>
        </div>
      </div>
    </div>,

    <div key="s2" style={{animation:'fadeSlide .4s ease'}}>
      <div className="section">
        <div className="section-label">{t.allergies}</div>
        <TagInput placeholder={t.allergiesPlaceholder} tags={guest.allergies} onAdd={v => onChange({ ...guest, allergies: [...guest.allergies, v] })} onRemove={v => onChange({ ...guest, allergies: guest.allergies.filter(a => a !== v) })} className="danger"/>
      </div>
      <div className="section">
        <div className="section-label">{t.dislikes}</div>
        <TagInput placeholder={t.dislikesPlaceholder} tags={guest.dislikes} onAdd={v => onChange({ ...guest, dislikes: [...guest.dislikes, v] })} onRemove={v => onChange({ ...guest, dislikes: guest.dislikes.filter(d => d !== v) })} className="dislike"/>
      </div>
      <div className="section">
        <div className="section-label">{t.dietary}</div>
        <div className="chips">{t.diets.map(item => <span key={item} className={`chip ${guest.diets.includes(item)?'on':''}`} onClick={() => toggleChip('diet',item)}>{item}</span>)}</div>
      </div>
    </div>,

    <div key="s3" style={{animation:'fadeSlide .4s ease'}}>
      <div className="section">
        <div className="section-label">{t.cuisines}</div>
        <div className="chips">{t.cuisineList.map(item => <span key={item} className={`chip ${guest.cuisines.includes(item)?'on':''}`} onClick={() => toggleChip('cuisine',item)}>{item}</span>)}</div>
      </div>
      <div className="section">
        <div className="section-label">{t.favorites}</div>
        <div className="field"><textarea placeholder={t.favoritesPlaceholder} value={guest.favorites||''} onChange={e => onChange({ ...guest, favorites: e.target.value })}/></div>
      </div>
      <div className="section">
        <div className="section-label">{t.spirits}</div>
        <div className="field"><textarea placeholder={t.spiritsPlaceholder} value={guest.spirits||''} onChange={e => onChange({ ...guest, spirits: e.target.value })}/></div>
      </div>
      <div className="section">
        <div className="section-label">{t.cocktails}</div>
        <div className="field"><textarea placeholder={t.cocktailsPlaceholder} value={guest.cocktails||''} onChange={e => onChange({ ...guest, cocktails: e.target.value })}/></div>
      </div>
      <div className="section">
        <div className="section-label">{t.softs}</div>
        <div className="field"><textarea placeholder={t.softsPlaceholder} value={guest.softs||''} onChange={e => onChange({ ...guest, softs: e.target.value })}/></div>
      </div>
    </div>,

    <div key="s4" style={{animation:'fadeSlide .4s ease'}}>
      <div className="section">
        <div className="section-label">{t.mealTimes}</div>
        <TimeSelector label={t.breakfastTime} value={guest.breakfast_time||'08:00'} onChange={v => onChange({ ...guest, breakfast_time: v })}/>
        <TimeSelector label={t.lunchTime} value={guest.lunch_time||'13:00'} onChange={v => onChange({ ...guest, lunch_time: v })}/>
        <TimeSelector label={t.dinnerTime} value={guest.dinner_time||'20:00'} onChange={v => onChange({ ...guest, dinner_time: v })}/>
      </div>
      <div className="section">
        <div className="section-label">{t.breakfast}</div>
        <div className="field"><textarea placeholder={t.breakfastPlaceholder} value={guest.breakfast||''} onChange={e => onChange({ ...guest, breakfast: e.target.value })}/></div>
      </div>
      <div className="section">
        <div className="section-label">{t.juices}</div>
        <div className="field"><textarea placeholder={t.juicesPlaceholder} value={guest.juices||''} onChange={e => onChange({ ...guest, juices: e.target.value })}/></div>
      </div>
      <div className="section">
        <div className="section-label">{t.notes}</div>
        <div className="field"><textarea placeholder={t.notesPlaceholder} value={guest.notes||''} onChange={e => onChange({ ...guest, notes: e.target.value })}/></div>
      </div>
    </div>
  ]

  return (
    <div>
      <StepIndicator current={step} total={4} labels={t.steps}/>
      {steps[step]}
      <div style={{display:'flex',gap:'12px',marginTop:'32px'}}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={{flex:1,padding:'14px',background:'transparent',color:'var(--ink)',border:'1px solid var(--border)',cursor:'pointer',fontFamily:'DM Sans,sans-serif',fontSize:'12px',fontWeight:'500',letterSpacing:'.1em',textTransform:'uppercase',borderRadius:'1px',transition:'all .2s'}}>
            {t.back}
          </button>
        )}
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} className="btn-primary" style={{flex:1,margin:0}}>
            {t.next} →
          </button>
        ) : (
          <button onClick={onSubmit} className="btn-primary" style={{flex:1,margin:0}}>
            {t.submit}
          </button>
        )}
      </div>
    </div>
  )
}

export default function GuestPage() {
  const { token } = useParams()
  const [lang, setLang] = useState('en')
  const [charter, setCharter] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [guests, setGuests] = useState([emptyGuest()])
  const [activeGuest, setActiveGuest] = useState(0)
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const t = TRANSLATIONS[lang]

  useEffect(() => {
    const fetchCharter = async () => {
      const { data } = await supabase.from('charters').select('*').eq('guest_token', token).single()
      if (data) setCharter(data)
      else setNotFound(true)
    }
    fetchCharter()
  }, [token])

  useEffect(() => {
    setStep(0)
  }, [activeGuest])

  const addGuest = () => {
    setGuests([...guests, emptyGuest()])
    setActiveGuest(guests.length)
    setStep(0)
  }

  const removeGuest = (index) => {
    const updated = guests.filter((_, i) => i !== index)
    setGuests(updated)
    setActiveGuest(Math.max(0, activeGuest - 1))
    setStep(0)
  }

  const updateGuest = (index, data) => {
    const updated = [...guests]
    updated[index] = data
    setGuests(updated)
  }

  const submitAll = async () => {
    for (const guest of guests) {
      if (!guest.name) continue
      await supabase.from('guests').upsert({
        name: guest.name,
        email: guest.email?.trim().toLowerCase() || null,
        allergies: guest.allergies,
        dislikes: guest.dislikes,
        diets: guest.diets,
        cuisines: guest.cuisines,
        favorites: guest.favorites,
        spirits: guest.spirits,
        cocktails: guest.cocktails,
        softs: guest.softs,
        breakfast: guest.breakfast,
        juices: guest.juices,
        notes: guest.notes,
        breakfast_time: guest.breakfast_time,
        lunch_time: guest.lunch_time,
        dinner_time: guest.dinner_time,
        charter_id: charter.id,
        archived: false
      }, { onConflict: 'email' })
    }
    setSubmitted(true)
  }

  if (notFound) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <nav><div className="brand">The Galley</div></nav>
      <main style={{textAlign:'center',paddingTop:'80px'}}>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontWeight:300}}>{t.notFound}</h1>
        <p style={{color:'var(--muted)',marginTop:'12px'}}>{t.notFoundMsg}</p>
      </main>
    </>
  )

  if (!charter) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <nav><div className="brand">The Galley</div></nav>
      <main style={{textAlign:'center',paddingTop:'80px'}}>
        <p style={{color:'var(--muted)'}}>{t.loading}</p>
      </main>
    </>
  )

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <nav>
        <div className="brand">The Galley</div>
        <div style={{display:'flex',gap:'6px'}}>
          {Object.entries(TRANSLATIONS).map(([code, val]) => (
            <button key={code} onClick={() => setLang(code)} style={{background: lang===code ? '#fff' : 'transparent',border:'none',borderRadius:'4px',padding:'4px 8px',cursor:'pointer',fontSize:'18px',opacity: lang===code ? 1 : 0.5}}>
              {val.flag}
            </button>
          ))}
        </div>
      </nav>

      <main style={{maxWidth:'560px'}}>
        {!submitted ? (
          <div>
            <div className="page-header">
              <h1>{t.title} <em>{t.titleItalic}</em><br/>{t.titleEnd}</h1>
              <p>{t.subtitle}</p>
            </div>

            <div style={{display:'flex',gap:'8px',marginBottom:'40px',flexWrap:'wrap'}}>
              {guests.map((g, i) => (
                <div key={i} onClick={() => setActiveGuest(i)} style={{padding:'7px 16px',cursor:'pointer',borderRadius:'20px',border:`1px solid ${activeGuest===i ? 'var(--accent)' : 'var(--border)'}`,background: activeGuest===i ? 'var(--accent)' : '#fff',color: activeGuest===i ? '#fff' : 'var(--muted)',fontSize:'12px',fontWeight:'500',display:'flex',alignItems:'center',gap:'8px',transition:'all .2s'}}>
                  {g.name || `Guest ${i+1}`}
                  {guests.length > 1 && <span onClick={e => { e.stopPropagation(); removeGuest(i) }} style={{opacity:.6,cursor:'pointer',fontSize:'14px'}}>×</span>}
                </div>
              ))}
              <button onClick={addGuest} style={{padding:'7px 16px',border:'1px dashed var(--border)',borderRadius:'20px',background:'transparent',cursor:'pointer',fontSize:'12px',color:'var(--muted)',fontWeight:'500'}}>
                {t.addGuest}
              </button>
            </div>

            <GuestForm
              key={activeGuest}
              guest={guests[activeGuest]}
              onChange={data => updateGuest(activeGuest, data)}
              t={t}
              onSubmit={submitAll}
              step={step}
              setStep={setStep}
            />
          </div>
        ) : (
          <div style={{paddingTop:'80px',textAlign:'center'}}>
            <div style={{fontSize:'48px',marginBottom:'24px'}}>✓</div>
            <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'40px',fontWeight:300,marginBottom:'16px'}}>{t.thankYou}</h1>
            <p style={{color:'var(--muted)',lineHeight:1.8,maxWidth:'400px',margin:'0 auto'}}>{t.thankYouMsg}</p>
          </div>
        )}
      </main>
    </>
  )
}