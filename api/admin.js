import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action, adminId, payload } = req.body

  if (!adminId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Verify admin exists
  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('id', adminId)
    .single()

  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    switch (action) {
      case 'list_yachts': {
        const { data } = await supabase
          .from('yachts')
          .select('*')
          .eq('agency_id', adminId)
          .order('created_at', { ascending: false })
        return res.status(200).json({ data })
      }

      case 'create_yacht': {
        const { data } = await supabase.from('yachts').insert({
          name: payload.name,
          agency_id: adminId,
          crew_password: payload.crew_password || 'crew2026'
        }).select().single()
        return res.status(200).json({ data })
      }

      case 'update_crew_password': {
        await supabase.from('yachts')
          .update({ crew_password: payload.password })
          .eq('id', payload.yachtId)
        return res.status(200).json({ ok: true })
      }

      case 'delete_yacht': {
        const { data: charters } = await supabase
          .from('charters')
          .select('id')
          .eq('yacht_id', payload.yachtId)
        if (charters) {
          for (const c of charters) {
            await supabase.from('guests').update({ charter_id: null }).eq('charter_id', c.id)
          }
        }
        await supabase.from('charters').delete().eq('yacht_id', payload.yachtId)
        await supabase.from('yachts').delete().eq('id', payload.yachtId)
        return res.status(200).json({ ok: true })
      }

      case 'list_charters': {
        const { data } = await supabase
          .from('charters')
          .select('*')
          .eq('yacht_id', payload.yachtId)
          .order('created_at', { ascending: false })
        return res.status(200).json({ data })
      }

      case 'create_charter': {
        const { data } = await supabase.from('charters').insert({
          name: payload.name,
          yacht_id: payload.yachtId,
          active: null
        }).select().single()
        return res.status(200).json({ data })
      }

      case 'set_active_charter': {
        await supabase.from('charters')
          .update({ active: null })
          .eq('yacht_id', payload.yachtId)
          .neq('id', payload.charterId)
          .is('active', true)
        await supabase.from('charters')
          .update({ active: true })
          .eq('id', payload.charterId)
        return res.status(200).json({ ok: true })
      }

      case 'end_charter': {
        await supabase.from('guests')
          .update({ archived: true })
          .eq('charter_id', payload.charterId)
        await supabase.from('charters')
          .update({ active: false })
          .eq('id', payload.charterId)
        return res.status(200).json({ ok: true })
      }

      default:
        return res.status(400).json({ error: 'Unknown action' })
    }
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}