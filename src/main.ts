import './assets/main.css'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import { auth } from '~/config/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const SESSION_ACTIVITY_KEY = 'nessia:lastActivityAt'
const SESSION_TIMEOUT_MS = 10 * 60 * 1000
const SESSION_CHECK_INTERVAL_MS = 30 * 1000

const readLastActivity = () => {
	const raw = localStorage.getItem(SESSION_ACTIVITY_KEY)
	if (!raw) return 0
	const value = Number(raw)
	return Number.isFinite(value) ? value : 0
}

const markSessionActivity = () => {
	localStorage.setItem(SESSION_ACTIVITY_KEY, String(Date.now()))
}

const clearSessionActivity = () => {
	localStorage.removeItem(SESSION_ACTIVITY_KEY)
}

const setupInactivityLogout = () => {
	const activityEvents: Array<keyof WindowEventMap> = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart']
	let lastMarkedAt = 0

	const touch = () => {
		if (!auth.currentUser) return
		const now = Date.now()
		// Throttle writes to localStorage.
		if (now - lastMarkedAt < 1000) return
		lastMarkedAt = now
		markSessionActivity()
	}

	activityEvents.forEach((eventName) => {
		window.addEventListener(eventName, touch, { passive: true })
	})

	onAuthStateChanged(auth, (user) => {
		if (user) {
			markSessionActivity()
			return
		}

		clearSessionActivity()
	})

	window.setInterval(async () => {
		if (!auth.currentUser) return

		const lastActivityAt = readLastActivity()
		if (!lastActivityAt) {
			markSessionActivity()
			return
		}

		if (Date.now() - lastActivityAt <= SESSION_TIMEOUT_MS) return

		await signOut(auth)
		if (router.currentRoute.value.path !== '/signin') {
			await router.replace({ path: '/signin', query: { error: 'session_expired' } })
		}
	}, SESSION_CHECK_INTERVAL_MS)
}

const app = createApp(App)

app.use(router)
app.use(VueApexCharts)

setupInactivityLogout()

app.mount('#app')
