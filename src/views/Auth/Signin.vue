<template>
  <FullScreenLayout>
    <div class="relative flex min-h-screen items-center justify-center bg-white px-4 dark:bg-gray-900">
      <div class="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="flex justify-center">
            <img
              src="/images/logo/logo.png"
              alt="Nessia Logo"
              class="h-10 w-auto dark:hidden"
            />
            <img
              src="/images/logo/logo-dark.png"
              alt="Nessia Logo"
              class="hidden h-10 w-auto dark:block"
            />
          </div>

          <div
            v-if="errorMessage"
            class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200"
          >
            {{ errorMessage }}
          </div>

          <div>
            <label
              for="email"
              class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
            >
              Email<span class="text-error-500">*</span>
            </label>
            <input
              v-model="email"
              type="email"
              id="email"
              name="email"
              placeholder="admin@nessia.ma"
              class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>

          <div>
            <label
              for="password"
              class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
            >
              Password<span class="text-error-500">*</span>
            </label>
            <input
              v-model="password"
              type="password"
              id="password"
              placeholder="********"
              class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
          >
            {{ isSubmitting ? 'Connexion...' : 'Connexion' }}
          </button>
        </form>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { setPersistence, browserLocalPersistence, browserSessionPersistence, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import { auth, db } from '~/config/firebase'
import type { SuperAdmin } from '~/types'

defineOptions({ name: 'SignInPage' })

type AllowedRole = SuperAdmin['role']

const ALLOWED_ROLES: AllowedRole[] = ['superadmin', 'admin', 'staff']
const SESSION_ACTIVITY_KEY = 'nessia:lastActivityAt'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const keepLoggedIn = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

if (route.query.error === 'unauthorized') {
  errorMessage.value = 'Acces refuse. Compte non autorise pour le back-office.'
}

if (route.query.error === 'session_expired') {
  errorMessage.value = 'Session expiree apres 10 minutes d\'inactivite.'
}

const isAllowedRole = (role?: string): role is AllowedRole => {
  if (!role) return false
  return ALLOWED_ROLES.includes(role as AllowedRole)
}

const getReadableAuthError = (message: string) => {
  if (
    message.includes('auth/invalid-credential')
    || message.includes('auth/wrong-password')
    || message.includes('auth/user-not-found')
    || message.includes('auth/invalid-email')
  ) {
    return 'Email ou mot de passe invalide.'
  }

  return message
}

const handleSubmit = async () => {
  if (isSubmitting.value) return

  errorMessage.value = ''

  const cleanEmail = email.value.trim()
  if (!cleanEmail || !password.value) {
    errorMessage.value = 'Email et mot de passe sont obligatoires.'
    return
  }

  isSubmitting.value = true

  try {
    await setPersistence(auth, keepLoggedIn.value ? browserLocalPersistence : browserSessionPersistence)

    const credentials = await signInWithEmailAndPassword(auth, cleanEmail, password.value)
    const uid = credentials.user.uid
    const adminSnap = await getDoc(doc(db, 'superadmins', uid))

    if (!adminSnap.exists()) {
      await signOut(auth)
      throw new Error('Acces refuse: compte absent dans superadmins.')
    }

    const adminData = adminSnap.data() as SuperAdmin
    const role = String(adminData.role || '').toLowerCase()
    if (!isAllowedRole(role)) {
      await signOut(auth)
      throw new Error('Acces refuse: role non autorise.')
    }

    if (adminData.active === false) {
      await signOut(auth)
      throw new Error('Acces refuse: compte desactive.')
    }

    const redirectTo = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/'

    localStorage.setItem(SESSION_ACTIVITY_KEY, String(Date.now()))

    await router.replace(redirectTo)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Connexion impossible.'
    errorMessage.value = getReadableAuthError(message)
  } finally {
    isSubmitting.value = false
  }
}
</script>
