/* eslint-env node */
/* eslint-disable no-undef */
// Migrate Firestore 'appointments' collection to Supabase 'appointments' table
// Usage: npm run migrate:appointments

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

  console.log('Fetching Firestore appointments...')
  const snap = await getDocs(collection(db, 'appointments'))
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  console.log(`Found ${docs.length} documents.`)

  let inserted = 0
  let skipped = 0
  let failed = 0

  for (const doc of docs) {
    const payload = {
      patient_name: doc.patientName || null,
      patient_phone: doc.patientPhone || null,
      patient_email: doc.patientEmail || null,
      patient_age: doc.patientAge != null ? Number(doc.patientAge) : null,
      patient_gender: doc.patientGender || null,
      appointment_date: doc.appointmentDate || null,
      appointment_time: doc.appointmentTime || null,
      appointment_type: doc.appointmentType || null,
      status: doc.status || 'scheduled',
      notes: doc.notes || null,
      symptoms: doc.symptoms || null,
      medical_history: doc.medicalHistory || null,
      medications: doc.medications || null,
      vital_signs: doc.vitalSigns || {},
      doctor_id: doc.doctorId || null,
      doctor_name: doc.doctorName || null,
      created_by: doc.createdBy || null,
      created_at: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
      updated_at: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null
    }

    // Idempotency: same patient + date + time + doctor
    const { data: existing, error: selErr } = await supabase
      .from('appointments')
      .select('id')
      .eq('patient_name', payload.patient_name)
      .eq('appointment_date', payload.appointment_date)
      .eq('appointment_time', payload.appointment_time)
      .eq('doctor_name', payload.doctor_name)
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

    const { error: insErr } = await supabase.from('appointments').insert([payload])
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
