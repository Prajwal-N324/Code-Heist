export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reg_id, team_name, department, year, agents } = req.body;

    // Validate required fields
    if (!reg_id || !team_name || !department || !year || !agents || agents.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      return res.status(500).json({ error: 'Firebase configuration missing' });
    }

    // Use Firestore REST API to write the document (no SDK needed server-side)
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/team_registrations?key=${apiKey}`;

    const firestoreBody = {
      fields: {
        reg_id:        { stringValue: String(reg_id) },
        team_name:     { stringValue: String(team_name) },
        department:    { stringValue: String(department) },
        year:          { integerValue: Number(year) },
        registered_at: { stringValue: new Date().toISOString() },
        agents: {
          arrayValue: {
            values: agents.map(a => ({
              mapValue: {
                fields: {
                  name: { stringValue: String(a.name) },
                  usn:  { stringValue: String(a.usn) },
                }
              }
            }))
          }
        }
      }
    };

    // Add a 10-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let restRes;
    try {
      restRes = await fetch(firestoreUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firestoreBody),
        signal: controller.signal,
      });
      clearTimeout(timeout);
    } catch (fetchErr) {
      clearTimeout(timeout);
      if (fetchErr.name === 'AbortError') {
        return res.status(504).json({ error: 'Firebase request timed out. Check your internet connection.' });
      }
      throw fetchErr;
    }

    if (!restRes.ok) {
      const errBody = await restRes.json().catch(() => ({}));
      const msg = errBody?.error?.message || `Firebase error: HTTP ${restRes.status}`;
      console.error('[register-team] Firestore REST error:', msg);
      return res.status(restRes.status).json({ error: msg });
    }

    const restData = await restRes.json();
    const docId = restData.name?.split('/').pop() || reg_id;

    return res.status(200).json({
      success: true,
      message: 'Team registered successfully',
      data: [{ id: docId, reg_id }]
    });

  } catch (error) {
    console.error('[register-team] Unexpected error:', error.message);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
