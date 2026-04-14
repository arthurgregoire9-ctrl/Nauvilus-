import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { createClient } from "@supabase/supabase-js"
const supabase = createClient("https://dmqgbxjnfkjnkpfirfdl.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcWdieGpuZmtqbmtwZmlyZmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDA0NzYsImV4cCI6MjA5MTY3NjQ3Nn0.y16FCg_HXkd7Ua_CU7K2o5Kd-QuEXxbz18hZsj4GaHI")

const TRANSLATIONS = {
  en: {
    flag: '🇬🇧',
    title: 'Your', titleItalic: 'culinary', titleEnd: 'preferences',
    subtitle: 'This information allows our private chef to personalise every dining experience exclusively for you.',
    returning: 'Returning guest?',
    emailPlaceholder: 'Enter your email to retrieve your profile',
    profileFound: '✓ Profile found — your preferences have been loaded.',
    profileNotFound: 'No profile found. Please fill in your preferences below.',
    personalDetails: 'Personal Details',
    firstName: 'First name',
    firstNamePlaceholder: 'e.g. Alexandra',
    email: 'Email — used to save and retrieve your profile',
    emailInputPlaceholder: 'e.g. alexandra@email.com',
    allergies: 'Allergies and Intolerances',
    allergiesPlaceholder: 'e.g. Nuts, Shellfish, Lactose',
    dislikes: 'Disliked Ingredients',
    dislikesPlaceholder: 'e.g. Coriander, Liver, Pineapple',
    dietary: 'Dietary Requirements',
    cuisines: 'Preferred Cuisines',
    favorites: 'Favourite Dishes and Flavours',
    favoritesPlaceholder: 'e.g. I love fresh sashimi, hand-made pasta, anything with black truffle',
    spirits: 'Favourite Spirits',
    spiritsPlaceholder: 'e.g. Macallan 18, Grey Goose, Don Julio 1942',
    cocktails: 'Favourite Cocktails',
    cocktailsPlaceholder: 'e.g. Negroni, Mojito, Aperol Spritz',
    softs: 'Favourite Soft Drinks',
    softsPlaceholder: 'e.g. San Pellegrino, Fever-Tree Ginger Beer, fresh lemonade',
    breakfast: 'Breakfast Preferences',
    breakfastPlaceholder: 'e.g. Eggs Benedict, fresh fruit, granola, continental',
    juices: 'Favourite Juices',
    juicesPlaceholder: 'e.g. Fresh orange, green juice, watermelon',
    notes: 'Additional Notes',
    notesPlaceholder: 'e.g. I prefer lighter meals at lunch, no red meat in the evening',
    submit: 'Submit all preferences to the crew',
    thankYou: 'Thank you.',
    thankYouMsg: 'Your preferences have been saved and transmitted to the crew. Our private chef will ensure every meal is tailored to your taste throughout your time on board.',
    addGuest: '+ Add guest',
    notFound: 'Link not found',
    notFoundMsg: 'Please contact your charter agency for a valid link.',
    loading: 'Loading...',
    diets: ["Vegan","Vegetarian","Halal","Kosher","Keto","Gluten-free","Lactose-free","Paleo","No Pork"],
    cuisineList: ["Japanese","Italian","French","Mediterranean","Asian","American","Mexican","Indian","Greek","Levantine"],
  },
  fr: {
    flag: '🇫🇷',
    title: 'Vos', titleItalic: 'préférences', titleEnd: 'culinaires',
    subtitle: 'Ces informations permettent à notre chef privé de personnaliser chaque repas exclusivement pour vous.',
    returning: 'Déjà client ?',
    emailPlaceholder: 'Entrez votre email pour retrouver votre profil',
    profileFound: '✓ Profil trouvé — vos préférences ont été chargées.',
    profileNotFound: 'Aucun profil trouvé. Veuillez remplir vos préférences ci-dessous.',
    personalDetails: 'Informations personnelles',
    firstName: 'Prénom',
    firstNamePlaceholder: 'ex. Alexandra',
    email: 'Email — utilisé pour sauvegarder et retrouver votre profil',
    emailInputPlaceholder: 'ex. alexandra@email.com',
    allergies: 'Allergies et intolérances',
    allergiesPlaceholder: 'ex. Noix, Crustacés, Lactose',
    dislikes: 'Aliments détestés',
    dislikesPlaceholder: 'ex. Coriandre, Foie, Ananas',
    dietary: 'Régimes alimentaires',
    cuisines: 'Cuisines préférées',
    favorites: 'Plats et saveurs favoris',
    favoritesPlaceholder: 'ex. J adore les sushis frais, les pâtes fraîches, tout à base de truffe noire',
    spirits: 'Alcools forts préférés',
    spiritsPlaceholder: 'ex. Macallan 18, Grey Goose, Don Julio 1942',
    cocktails: 'Cocktails préférés',
    cocktailsPlaceholder: 'ex. Negroni, Mojito, Aperol Spritz',
    softs: 'Boissons sans alcool préférées',
    softsPlaceholder: 'ex. San Pellegrino, Fever-Tree Ginger Beer, limonade fraîche',
    breakfast: 'Petit-déjeuner préféré',
    breakfastPlaceholder: 'ex. Oeufs Benedict, fruits frais, granola, continental',
    juices: 'Jus préférés',
    juicesPlaceholder: 'ex. Orange pressée, jus vert, pastèque',
    notes: 'Notes supplémentaires',
    notesPlaceholder: 'ex. Je préfère les repas légers le midi, pas de viande rouge le soir',
    submit: 'Envoyer mes préférences à l équipage',
    thankYou: 'Merci.',
    thankYouMsg: 'Vos préférences ont été sauvegardées et transmises à l équipage. Notre chef privé veillera à adapter chaque repas à vos goûts tout au long de votre séjour à bord.',
    addGuest: '+ Ajouter un invité',
    notFound: 'Lien introuvable',
    notFoundMsg: 'Veuillez contacter votre agence de charter pour obtenir un lien valide.',
    loading: 'Chargement...',
    diets: ["Vegan","Végétarien","Halal","Casher","Keto","Sans gluten","Sans lactose","Paleo","Sans porc"],
    cuisineList: ["Japonaise","Italienne","Française","Méditerranéenne","Asiatique","Américaine","Mexicaine","Indienne","Grecque","Levantine"],
  },
  it: {
    flag: '🇮🇹',
    title: 'Le tue', titleItalic: 'preferenze', titleEnd: 'culinarie',
    subtitle: 'Queste informazioni permettono al nostro chef privato di personalizzare ogni esperienza culinaria esclusivamente per te.',
    returning: 'Già cliente?',
    emailPlaceholder: 'Inserisci la tua email per recuperare il tuo profilo',
    profileFound: '✓ Profilo trovato — le tue preferenze sono state caricate.',
    profileNotFound: 'Nessun profilo trovato. Per favore compila le tue preferenze qui sotto.',
    personalDetails: 'Dati personali',
    firstName: 'Nome',
    firstNamePlaceholder: 'es. Alexandra',
    email: 'Email — usata per salvare e recuperare il tuo profilo',
    emailInputPlaceholder: 'es. alexandra@email.com',
    allergies: 'Allergie e intolleranze',
    allergiesPlaceholder: 'es. Noci, Crostacei, Lattosio',
    dislikes: 'Ingredienti non graditi',
    dislikesPlaceholder: 'es. Coriandolo, Fegato, Ananas',
    dietary: 'Requisiti dietetici',
    cuisines: 'Cucine preferite',
    favorites: 'Piatti e sapori preferiti',
    favoritesPlaceholder: 'es. Adoro il sashimi fresco, la pasta fatta in casa, tutto al tartufo nero',
    spirits: 'Superalcolici preferiti',
    spiritsPlaceholder: 'es. Macallan 18, Grey Goose, Don Julio 1942',
    cocktails: 'Cocktail preferiti',
    cocktailsPlaceholder: 'es. Negroni, Mojito, Aperol Spritz',
    softs: 'Bevande analcoliche preferite',
    softsPlaceholder: 'es. San Pellegrino, Fever-Tree Ginger Beer, limonata fresca',
    breakfast: 'Colazione preferita',
    breakfastPlaceholder: 'es. Uova Benedict, frutta fresca, granola, continentale',
    juices: 'Succhi preferiti',
    juicesPlaceholder: 'es. Arancia fresca, succo verde, anguria',
    notes: 'Note aggiuntive',
    notesPlaceholder: 'es. Preferisco pasti leggeri a pranzo, niente carne rossa la sera',
    submit: 'Invia le preferenze all equipaggio',
    thankYou: 'Grazie.',
    thankYouMsg: 'Le tue preferenze sono state salvate e trasmesse all equipaggio. Il nostro chef privato si assicurera che ogni pasto sia adattato ai tuoi gusti durante il tuo soggiorno a bordo.',
    addGuest: '+ Aggiungi ospite',
    notFound: 'Link non trovato',
    notFoundMsg: 'Contatta la tua agenzia charter per ottenere un link valido.',
    loading: 'Caricamento...',
    diets: ["Vegano","Vegetariano","Halal","Kosher","Keto","Senza glutine","Senza lattosio","Paleo","Senza maiale"],
    cuisineList: ["Giapponese","Italiana","Francese","Mediterranea","Asiatica","Americana","Messicana","Indiana","Greca","Levantina"],
  },
  ru: {
    flag: '🇷🇺',
    title: 'Ваши', titleItalic: 'кулинарные', titleEnd: 'предпочтения',
    subtitle: 'Эта информация позволяет нашему личному шеф-повару персонализировать каждый прием пищи исключительно для вас.',
    returning: 'Уже были у нас?',
    emailPlaceholder: 'Введите email для загрузки вашего профиля',
    profileFound: '✓ Профиль найден — ваши предпочтения загружены.',
    profileNotFound: 'Профиль не найден. Пожалуйста, заполните предпочтения ниже.',
    personalDetails: 'Личные данные',
    firstName: 'Имя',
    firstNamePlaceholder: 'напр. Александра',
    email: 'Email — для сохранения и получения вашего профиля',
    emailInputPlaceholder: 'напр. alexandra@email.com',
    allergies: 'Аллергии и непереносимости',
    allergiesPlaceholder: 'напр. Орехи, Морепродукты, Лактоза',
    dislikes: 'Нежелательные ингредиенты',
    dislikesPlaceholder: 'напр. Кинза, Печень, Ананас',
    dietary: 'Диетические требования',
    cuisines: 'Предпочитаемые кухни',
    favorites: 'Любимые блюда и вкусы',
    favoritesPlaceholder: 'напр. Я люблю свежее сашими, домашнюю пасту, всё с чёрным трюфелем',
    spirits: 'Предпочитаемые крепкие напитки',
    spiritsPlaceholder: 'напр. Macallan 18, Grey Goose, Don Julio 1942',
    cocktails: 'Любимые коктейли',
    cocktailsPlaceholder: 'напр. Негрони, Мохито, Апероль Шприц',
    softs: 'Любимые безалкогольные напитки',
    softsPlaceholder: 'напр. San Pellegrino, Fever-Tree Ginger Beer, свежий лимонад',
    breakfast: 'Предпочтения по завтраку',
    breakfastPlaceholder: 'напр. Яйца Бенедикт, свежие фрукты, гранола, континентальный',
    juices: 'Любимые соки',
    juicesPlaceholder: 'напр. Свежий апельсин, зелёный сок, арбуз',
    notes: 'Дополнительные заметки',
    notesPlaceholder: 'напр. Предпочитаю лёгкие блюда на обед, без красного мяса вечером',
    submit: 'Отправить предпочтения экипажу',
    thankYou: 'Спасибо.',
    thankYouMsg: 'Ваши предпочтения сохранены и переданы экипажу. Наш шеф-повар позаботится о том, чтобы каждое блюдо соответствовало вашему вкусу на протяжении всего пребывания на борту.',
    addGuest: '+ Добавить гостя',
    notFound: 'Ссылка не найдена',
    notFoundMsg: 'Пожалуйста, свяжитесь с вашим чартерным агентством для получения действительной ссылки.',
    loading: 'Загрузка...',
    diets: ["Веган","Вегетарианец","Халяль","Кошер","Кето","Без глютена","Без лактозы","Палео","Без свинины"],
    cuisineList: ["Японская","Итальянская","Французская","Средиземноморская","Азиатская","Американская","Мексиканская","Индийская","Греческая","Левантийская"],
  }
}

const emptyGuest = () => ({ name:'', email:'', allergies:[], dislikes:[], diets:[], cuisines:[], favorites:'', spirits:'', cocktails:'', softs:'', breakfast:'', juices:'', notes:'' })

function GuestForm({ guest, onChange, t }) {
  const [allergyInput, setAllergyInput] = useState('')
  const [dislikeInput, setDislikeInput] = useState('')
  const [emailLookup, setEmailLookup] = useState('')
  const [lookupStatus, setLookupStatus] = useState('')

  const lookupGuest = async () => {
    if (!emailLookup.trim()) return
    setLookupStatus('searching')
    const { data } = await supabase.from('guests').select('*').eq('email', emailLookup.trim().toLowerCase()).single()
    if (data) { onChange({ ...data }); setLookupStatus('found') }
    else setLookupStatus('notfound')
  }

  const addTag = (type) => {
    if (type === 'allergy') {
      const val = allergyInput.trim()
      if (val && !guest.allergies.includes(val)) onChange({ ...guest, allergies: [...guest.allergies, val] })
      setAllergyInput('')
    } else {
      const val = dislikeInput.trim()
      if (val && !guest.dislikes.includes(val)) onChange({ ...guest, dislikes: [...guest.dislikes, val] })
      setDislikeInput('')
    }
  }

  const removeTag = (type, val) => {
    if (type === 'allergy') onChange({ ...guest, allergies: guest.allergies.filter(a => a !== val) })
    else onChange({ ...guest, dislikes: guest.dislikes.filter(d => d !== val) })
  }

  const toggleChip = (type, item) => {
    if (type === 'diet') onChange({ ...guest, diets: guest.diets.includes(item) ? guest.diets.filter(d => d !== item) : [...guest.diets, item] })
    else onChange({ ...guest, cuisines: guest.cuisines.includes(item) ? guest.cuisines.filter(c => c !== item) : [...guest.cuisines, item] })
  }

  return (
    <div>
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
        <div className="section-label">{t.personalDetails}</div>
        <div className="field">
          <label>{t.firstName}</label>
          <input placeholder={t.firstNamePlaceholder} value={guest.name} onChange={e => onChange({ ...guest, name: e.target.value })}/>
        </div>
        <div className="field">
          <label>{t.email}</label>
          <input type="email" placeholder={t.emailInputPlaceholder} value={guest.email} onChange={e => onChange({ ...guest, email: e.target.value })}/>
        </div>
      </div>

      <div className="section">
        <div className="section-label">{t.allergies}</div>
        <div className="tag-row">
          <input placeholder={t.allergiesPlaceholder} value={allergyInput} onChange={e => setAllergyInput(e.target.value)} onKeyDown={e => e.key==='Enter' && addTag('allergy')}/>
          <button className="btn-add" onClick={() => addTag('allergy')}>+</button>
        </div>
        <div className="tags">{guest.allergies.map(v => <span key={v} className="tag danger">{v}<button onClick={() => removeTag('allergy',v)}>×</button></span>)}</div>
      </div>

      <div className="section">
        <div className="section-label">{t.dislikes}</div>
        <div className="tag-row">
          <input placeholder={t.dislikesPlaceholder} value={dislikeInput} onChange={e => setDislikeInput(e.target.value)} onKeyDown={e => e.key==='Enter' && addTag('dislike')}/>
          <button className="btn-add" onClick={() => addTag('dislike')}>+</button>
        </div>
        <div className="tags">{guest.dislikes.map(v => <span key={v} className="tag dislike">{v}<button onClick={() => removeTag('dislike',v)}>×</button></span>)}</div>
      </div>

      <div className="section">
        <div className="section-label">{t.dietary}</div>
        <div className="chips">{t.diets.map(item => <span key={item} className={`chip ${guest.diets.includes(item)?'on':''}`} onClick={() => toggleChip('diet',item)}>{item}</span>)}</div>
      </div>

      <div className="section">
        <div className="section-label">{t.cuisines}</div>
        <div className="chips">{t.cuisineList.map(item => <span key={item} className={`chip ${guest.cuisines.includes(item)?'on':''}`} onClick={() => toggleChip('cuisine',item)}>{item}</span>)}</div>
      </div>

      <div className="section">
        <div className="section-label">{t.favorites}</div>
        <div className="field"><textarea placeholder={t.favoritesPlaceholder} value={guest.favorites || ''} onChange={e => onChange({ ...guest, favorites: e.target.value })}/></div>
      </div>

      <div className="section">
        <div className="section-label">{t.spirits}</div>
        <div className="field"><textarea placeholder={t.spiritsPlaceholder} value={guest.spirits || ''} onChange={e => onChange({ ...guest, spirits: e.target.value })}/></div>
      </div>

      <div className="section">
        <div className="section-label">{t.cocktails}</div>
        <div className="field"><textarea placeholder={t.cocktailsPlaceholder} value={guest.cocktails || ''} onChange={e => onChange({ ...guest, cocktails: e.target.value })}/></div>
      </div>

      <div className="section">
        <div className="section-label">{t.softs}</div>
        <div className="field"><textarea placeholder={t.softsPlaceholder} value={guest.softs || ''} onChange={e => onChange({ ...guest, softs: e.target.value })}/></div>
      </div>

      <div className="section">
        <div className="section-label">{t.breakfast}</div>
        <div className="field"><textarea placeholder={t.breakfastPlaceholder} value={guest.breakfast || ''} onChange={e => onChange({ ...guest, breakfast: e.target.value })}/></div>
      </div>

      <div className="section">
        <div className="section-label">{t.juices}</div>
        <div className="field"><textarea placeholder={t.juicesPlaceholder} value={guest.juices || ''} onChange={e => onChange({ ...guest, juices: e.target.value })}/></div>
      </div>

      <div className="section">
        <div className="section-label">{t.notes}</div>
        <div className="field"><textarea placeholder={t.notesPlaceholder} value={guest.notes || ''} onChange={e => onChange({ ...guest, notes: e.target.value })}/></div>
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

  const addGuest = () => {
    setGuests([...guests, emptyGuest()])
    setActiveGuest(guests.length)
  }

  const removeGuest = (index) => {
    const updated = guests.filter((_, i) => i !== index)
    setGuests(updated)
    setActiveGuest(Math.max(0, activeGuest - 1))
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
        charter_id: charter.id,
        archived: false
      }, { onConflict: 'email' })
    }
    setSubmitted(true)
  }

  if (notFound) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <nav><div className="brand">The galley</div></nav>
      <main style={{textAlign:'center',paddingTop:'80px'}}>
        <h1 style={{fontFamily:'Cormorant Garamond, serif',fontWeight:300}}>{t.notFound}</h1>
        <p style={{color:'var(--muted)',marginTop:'12px'}}>{t.notFoundMsg}</p>
      </main>
    </>
  )

  if (!charter) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <nav><div className="brand">The galley</div></nav>
      <main style={{textAlign:'center',paddingTop:'80px'}}>
        <p style={{color:'var(--muted)'}}>{t.loading}</p>
      </main>
    </>
  )

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
      <nav>
        <div className="brand">The galley</div>
        <div style={{display:'flex',gap:'6px'}}>
          {Object.entries(TRANSLATIONS).map(([code, val]) => (
            <button key={code} onClick={() => setLang(code)} style={{background: lang===code ? '#fff' : 'transparent',border:'none',borderRadius:'4px',padding:'4px 8px',cursor:'pointer',fontSize:'18px',opacity: lang===code ? 1 : 0.5}}>
              {val.flag}
            </button>
          ))}
        </div>
      </nav>
      <main>
        <div className="page-header">
          <h1>{t.title} <em>{t.titleItalic}</em><br/>{t.titleEnd}</h1>
          <p>{t.subtitle}</p>
        </div>

        {!submitted ? (
          <div>
            <div style={{display:'flex',gap:'8px',marginBottom:'32px',flexWrap:'wrap'}}>
              {guests.map((g, i) => (
                <div key={i} onClick={() => setActiveGuest(i)} style={{padding:'8px 16px',cursor:'pointer',borderRadius:'2px',border:`1px solid ${activeGuest===i ? 'var(--accent)' : 'var(--border)'}`,background: activeGuest===i ? 'var(--accent)' : '#fff',color: activeGuest===i ? '#fff' : 'var(--muted)',fontSize:'13px',display:'flex',alignItems:'center',gap:'8px'}}>
                  {g.name || `Guest ${i+1}`}
                  {guests.length > 1 && <span onClick={e => { e.stopPropagation(); removeGuest(i) }} style={{opacity:.6,cursor:'pointer'}}>×</span>}
                </div>
              ))}
              <button onClick={addGuest} style={{padding:'8px 16px',border:'1px dashed var(--border)',borderRadius:'2px',background:'transparent',cursor:'pointer',fontSize:'13px',color:'var(--muted)'}}>{t.addGuest}</button>
            </div>
            <GuestForm guest={guests[activeGuest]} onChange={data => updateGuest(activeGuest, data)} t={t}/>
            <button className="btn-primary" onClick={submitAll}>{t.submit}</button>
          </div>
        ) : (
          <div className="success">
            <div className="success-ico">✓</div>
            <div>
              <h3>{t.thankYou}</h3>
              <p>{t.thankYouMsg}</p>
            </div>
          </div>
        )}
      </main>
    </>
  )
}