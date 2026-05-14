import { onMounted, onUnmounted } from 'vue'
import { signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { auth } from '~/config/firebase'
import { useAuthStore } from '~/stores/auth'

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const
const CHECK_INTERVAL_MS = 60_000 // check every 60 seconds

export const useSessionTimeout = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const handleActivity = () => authStore.refreshActivity()

  const checkSession = async () => {
    if (authStore.isAuthenticated() && authStore.isSessionExpired()) {
      await signOut(auth)
      authStore.clearUser()
      router.replace('/auth/sign-in')
    }
  }

  let intervalId: ReturnType<typeof setInterval>

  onMounted(() => {
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true }),
    )
    intervalId = setInterval(checkSession, CHECK_INTERVAL_MS)
  })

  onUnmounted(() => {
    ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity))
    clearInterval(intervalId)
  })
}
