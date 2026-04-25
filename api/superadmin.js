import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action, password, payload } = req.body

  // Vérifier le mot de passe super admin pour TOUTES les actions
  if (password !== process.env.SUPER_ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    switch (action) {
      case 'verify':
        return res.status(200).json({ ok: true })

      case 'list_agencies': {
        const { data } = await supabase
          .from('admins')
          .select('id, agency, password, created_at')
          .order('created_at', { ascending: false })
        return res.status(200).json({ data })
      }

      case 'create_agency': {
        const { data } = await supabase
          .from('admins')
          .insert({ agency: payload.agency, password: payload.password })
          .select()
          .single()
        return res.status(200).json({ data })
      }

      case 'delete_agency': {
        await supabase.from('yachts').update({ agency_id: null }).eq('agency_id', payload.id)
        await supabase.from('admins').delete().eq('id', payload.id)
        return res.status(200).json({ ok: true })
      }

      case 'update_agency_password': {
        await supabase.from('admins').update({ password: payload.password }).eq('id', payload.id)
        return res.status(200).json({ ok: true })
      }

      default:
        return res.status(400).json({ error: 'Unknown action' })
    }
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}