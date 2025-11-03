// Migrate Firestore 'attendances' collection to Supabase 'attendances' table
import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, deleteDoc, doc as fdoc } from 'firebase/firestore'
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
  const snap = await getDocs(collection(db, 'attendances'))
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  console.log(`Found ${docs.length} attendances`)
  let inserted = 0, skipped = 0, failed = 0
  for (const a of docs) {
    const payload = {
      patient_name: a.patientName || '',
      date: a.date || new Date().toISOString().slice(0,10),
      time: a.time || '00:00',
      type: a.type || 'consulta',
      status: a.status || 'agendado',
      symptoms: a.symptoms || null,
      diagnosis: a.diagnosis || null,
      treatment: a.treatment || null,
      notes: a.notes || null,
      doctor_name: a.doctorName || null,
      created_by: a.createdBy || null,
    }

    const { data: existing, error: selErr } = await supabase
      .from('attendances').select('id')
      .eq('patient_name', payload.patient_name)
      .eq('date', payload.date)
      .eq('time', payload.time)
      .limit(1).maybeSingle()
    if (selErr) { console.error(selErr); failed++; continue }
    if (existing) { skipped++; continue }

    const { error: insErr } = await supabase.from('attendances').insert([payload])
    if (insErr) { console.error(insErr); failed++ } else { inserted++ }
  }
  console.log(`Done. Inserted: ${inserted}, Skipped: ${skipped}, Failed: ${failed}`)
}

main().catch((e)=>{console.error(e);process.exit(1)})
