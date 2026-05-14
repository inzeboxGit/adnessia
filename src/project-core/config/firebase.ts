import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyC611-iKbBW_K8y0z8S1hF4x1mOIG2qi7c',
  authDomain: 'project-fc924aef-dff1-42ec-ba4.firebaseapp.com',
  projectId: 'project-fc924aef-dff1-42ec-ba4',
  storageBucket: 'project-fc924aef-dff1-42ec-ba4.firebasestorage.app',
  messagingSenderId: '116391674473',
  appId: '1:116391674473:web:f9e1017d413af92f0618f8',
  measurementId: 'G-M8C39REZZ0',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const analytics = getAnalytics(firebaseApp)
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)

// Resolves once Firebase has determined the initial auth state (after page reload).
// Use this before any route guard that checks authentication.
export const authReady: Promise<User | null> = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe()
    resolve(user)
  })
})
