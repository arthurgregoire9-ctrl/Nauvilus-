import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body

  if (password !== process.env.SUPER_ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const results = { admins: 0, yachts: 0 }

    // Hash admin passwords
    const { data: admins } = await supabase.from('admins').select('id, password')
    for (const admin of admins || []) {
      // Skip if already hashed (bcrypt hashes start with $2)
      if (admin.password && !admin.password.startsWith('$2')) {
        const hashed = await bcrypt.hash(admin.password, 10)
        await supabase.from('admins').update({ password: hashed }).eq('id', admin.id)
        results.admins++
      }
    }

    // Hash yacht crew passwords
    const { data: yachts } = await supabase.from('yachts').select('id, crew_password')
    for (const yacht of yachts || []) {
      if (yacht.crew_password && !yacht.crew_password.startsWith('$2')) {
        const hashed = await bcrypt.hash(yacht.crew_password, 10)
        await supabase.from('yachts').update({ crew_password: hashed }).eq('id', yacht.id)
        results.yachts++
      }
    }

    return res.status(200).json({ ok: true, results })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}