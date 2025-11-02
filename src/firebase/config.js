import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDPcB4HwKhm828oZ9u93f-lbIGFg6zxuxo",
  authDomain: "clinical-79d76.firebaseapp.com",
  projectId: "clinical-79d76",
  storageBucket: "clinical-79d76.firebasestorage.app",
  messagingSenderId: "577885187595",
  appId: "1:577885187595:web:bf74171d146935dc71610e"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication with persistence
export const auth = getAuth(app)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Auth persistence error:', error)
})

// Configure auth settings
auth.settings.appVerificationDisabledForTesting = false

// Initialize Firestore with AGGRESSIVE CACHING for better performance
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
})

export default app
