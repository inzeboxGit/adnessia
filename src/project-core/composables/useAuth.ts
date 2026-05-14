import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '~/config/firebase'
import { useAuthStore } from '~/stores/auth'
import type { SuperAdmin } from '~/types'

const ALLOWED_ROLES: SuperAdmin['role'][] = ['superadmin', 'admin', 'staff']

export const useAuth = () => {
  const router = useRouter()
  const authStore = useAuthStore()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const uid = credential.user.uid

      const snap = await getDoc(doc(db, 'superadmins', uid))
      if (!snap.exists()) {
        await signOut(auth)
        throw new Error('Access denied: no matching admin account found.')
      }

      const data = snap.data() as SuperAdmin
      if (!ALLOWED_ROLES.includes(data.role)) {
        await signOut(auth)
        throw new Error(`Access denied: role "${data.role}" is not authorized.`)
      }
      if (!data.active) {
        await signOut(auth)
        throw new Error('Access denied: this account is disabled.')
      }

      authStore.setUser(uid, { ...data, id: uid })
      router.replace('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.'
      // map Firebase auth error codes to readable messages
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
        error.value = 'Invalid email or password.'
      } else {
        error.value = msg
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    await signOut(auth)
    authStore.clearUser()
    router.replace('/auth/sign-in')
  }

  const isAuthenticated = () => authStore.isAuthenticated()

  return {
    login,
    logout,
    isAuthenticated,
    loading,
    error,
  }
}

