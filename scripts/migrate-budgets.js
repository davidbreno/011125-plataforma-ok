// Migrate Firestore 'budgets' collection to Supabase 'budgets' table
import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { createClient } from '@supabase/supabase-js'

const firebaseConfig = {
  apiKey: 'AIzaSyDPcB4HwKhm828oZ9u93f-lbIGFg6zxuxo',
  authDomain: 'clinical-79d76.firebaseapp.com',
  projectId: 'clinical-79d76',
  storageBucket: 'clinical-79d76.firebasestorage.app',
  messagingSenderId: '577885187595',
  appId: '1:577885187595:web:bf74171d146935dc71610e'
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase env vars.')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function main() {
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  const snap = await getDocs(collection(db, 'budgets'))
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  console.log(`Found ${docs.length} budgets`)
  let inserted = 0, skipped = 0, failed = 0
  for (const b of docs) {
    const payload = {
      patient_id: String(b.patientId || ''),
      patient_name: b.patientName || null,
      description: b.description || '',
      plan: b.plan || 'Particular',
      responsible: b.responsible || null,
      date: b.date || new Date().toISOString().slice(0,10),
      items: b.items || [],
      installments: parseInt(b.installments) || 1,
      due_day: parseInt(b.dueDay) || 5,
      status: b.status || 'em_orcamento',
      total: Number(b.total || 0),
      created_by: b.createdBy || null,
      approved_at: b.approvedAt || null,
    }
    if (!payload.patient_id) { skipped++; continue }

    const { data: existing, error: selErr } = await supabase
      .from('budgets').select('id')
      .eq('patient_id', payload.patient_id)
      .eq('description', payload.description)
      .eq('date', payload.date)
      .limit(1).maybeSingle()
    if (selErr) { console.error(selErr); failed++; continue }
    if (existing) { skipped++; continue }

    const { error: insErr } = await supabase.from('budgets').insert([payload])
    if (insErr) { console.error(insErr); failed++ } else { inserted++ }
  }
  console.log(`Done. Inserted: ${inserted}, Skipped: ${skipped}, Failed: ${failed}`)
}

main().catch((e)=>{console.error(e);process.exit(1)})
