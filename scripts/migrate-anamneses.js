// Migrate Firestore 'anamneses' collection to Supabase 'anamneses' table
// Usage: npm run migrate:anamneses

import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { createClient } from '@supabase/supabase-js'

// Firebase client config (public keys)
const firebaseConfig = {
  apiKey: 'AIzaSyDPcB4HwKhm828oZ9u93f-lbIGFg6zxuxo',
  authDomain: 'clinical-79d76.firebaseapp.com',
  projectId: 'clinical-79d76',
  storageBucket: 'clinical-79d76.firebasestorage.app',
  messagingSenderId: '577885187595',
  appId: '1:577885187595:web:bf74171d146935dc71610e'
}

// Supabase env vars
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or SUPABASE_URL/SUPABASE_ANON_KEY.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function main() {
  console.log('Initializing Firebase...')
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  console.log('Fetching Firestore anamneses...')
  const snap = await getDocs(collection(db, 'anamneses'))
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  console.log(`Found ${docs.length} documents.`)

  let inserted = 0
  let skipped = 0
  let failed = 0

  for (const doc of docs) {
    const payload = {
      patient_id: String(doc.patientId || ''),
      patient_name: doc.patientName || null,
      model: doc.model || 'Anamnese',
      date: doc.date || new Date().toISOString().slice(0,10),
      answers: doc.answers || {},
      created_by: doc.createdBy || null,
    }

    // Skip if missing patient_id
    if (!payload.patient_id) {
      console.warn(`Skipping doc ${doc.id}: missing patientId`)
      skipped++
      continue
    }

    // Idempotency check: same patient_id + date + model
    const { data: existing, error: selErr } = await supabase
      .from('anamneses')
      .select('id')
      .eq('patient_id', payload.patient_id)
      .eq('date', payload.date)
      .eq('model', payload.model)
      .limit(1)
      .maybeSingle()

    if (selErr) {
      console.error('Select error:', selErr)
      failed++
      continue
    }

    if (existing) {
      skipped++
      continue
    }

    const { error: insErr } = await supabase.from('anamneses').insert([payload])
    if (insErr) {
      console.error('Insert error:', insErr)
      failed++
    } else {
      inserted++
    }
  }

  console.log(`Done. Inserted: ${inserted}, Skipped: ${skipped}, Failed: ${failed}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
