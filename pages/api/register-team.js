import { db } from '@/lib/firebaseClient'
import { collection, addDoc } from 'firebase/firestore'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { reg_id, team_name, department, year, agents } = req.body

    // Validate required fields
    if (!reg_id || !team_name || !department || !year || !agents || agents.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Insert registration into Firestore
    try {
      const docRef = await addDoc(collection(db, 'team_registrations'), {
        reg_id: reg_id,
        team_name: team_name,
        department: department,
        year: year,
        agents: agents,
        registered_at: new Date().toISOString(),
      })

      return res.status(200).json({
        success: true,
        message: 'Team registered successfully',
        data: [{ id: docRef.id, reg_id: reg_id }]
      })
    } catch (error) {
      console.error('Firebase error:', error)
      return res.status(400).json({ error: error.message || 'Failed to register team' })
    }

  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
