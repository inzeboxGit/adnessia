import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SuperAdmin } from '~/types'

const SESSION_DURATION_MS = 20 * 60 * 1000 // 20 minutes

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<SuperAdmin | null>(null)
    const firebaseUid = ref<string | null>(null)
    const lastActivity = ref<number | null>(null)

    function setUser(uid: string, data: SuperAdmin) {
      firebaseUid.value = uid
      user.value = data
      lastActivity.value = Date.now()
    }

    function clearUser() {
      firebaseUid.value = null
      user.value = null
      lastActivity.value = null
    }

    function refreshActivity() {
      if (firebaseUid.value) {
        lastActivity.value = Date.now()
      }
    }

    const isAuthenticated = () => !!firebaseUid.value

    const isSessionExpired = () => {
      if (!lastActivity.value || !firebaseUid.value) return false
      return Date.now() - lastActivity.value > SESSION_DURATION_MS
    }

    return { user, firebaseUid, lastActivity, setUser, clearUser, refreshActivity, isAuthenticated, isSessionExpired }
  },
  { persist: true },
)
