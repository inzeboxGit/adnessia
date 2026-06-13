import { createRouter, createWebHistory } from 'vue-router'
import { getDoc, doc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { auth, authReady, db } from '~/config/firebase'
import type { SuperAdmin } from '~/types'

type AllowedRole = SuperAdmin['role']

const ALLOWED_ROLES: AllowedRole[] = ['superadmin', 'admin', 'staff']

const PUBLIC_PATHS = new Set(['/signin'])
const SESSION_ACTIVITY_KEY = 'nessia:lastActivityAt'
const SESSION_TIMEOUT_MS = 10 * 60 * 1000

let authorizedUid: string | null = null

const readLastActivity = () => {
  const raw = localStorage.getItem(SESSION_ACTIVITY_KEY)
  if (!raw) return 0
  const value = Number(raw)
  return Number.isFinite(value) ? value : 0
}

const isSessionExpired = () => {
  const lastActivityAt = readLastActivity()
  if (!lastActivityAt) return false
  return Date.now() - lastActivityAt > SESSION_TIMEOUT_MS
}

const markSessionActivity = () => {
  localStorage.setItem(SESSION_ACTIVITY_KEY, String(Date.now()))
}

const isAllowedRole = (role?: string): role is AllowedRole => {
  if (!role) return false
  return ALLOWED_ROLES.includes(role as AllowedRole)
}

const hasRouteAccess = async () => {
  const firebaseUser = auth.currentUser ?? await authReady

  if (!firebaseUser) {
    authorizedUid = null
    return false
  }

  if (authorizedUid === firebaseUser.uid) {
    return true
  }

  const adminSnap = await getDoc(doc(db, 'superadmins', firebaseUser.uid))
  if (!adminSnap.exists()) {
    await signOut(auth)
    authorizedUid = null
    return false
  }

  const adminData = adminSnap.data() as SuperAdmin
  const role = String(adminData.role || '').toLowerCase()
  if (!isAllowedRole(role) || adminData.active === false) {
    await signOut(auth)
    authorizedUid = null
    return false
  }

  authorizedUid = firebaseUser.uid
  return true
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Ecommerce',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'eCommerce Dashboard',
      },
    },
    {
      path: '/partenaires',
      name: 'Partenaires',
      component: () => import('../views/partenaires/Partenaires.vue'),
      meta: {
        title: 'Prestataires',
      },
    },
    {
      path: '/drivers',
      name: 'Drivers',
      component: () => import('../views/drivers/Drivers.vue'),
      meta: {
        title: 'Chauffeurs',
      },
    },
    {
      path: '/ride-requests',
      name: 'ride-requests',
      component: () => import('../views/rides/RideRequests.vue'),
      meta: {
        title: 'Gestion des courses',
      },
    },
    {
      path: '/drivers/:id',
      name: 'drivers.detail',
      component: () => import('../views/drivers/detail.vue'),
      meta: {
        title: 'Detail Chauffeur',
      },
    },
    {
      path: '/partenaires/pending',
      name: 'partenaires.pending',
      component: () => import('../views/partenaires/pending.vue'),
      meta: {
        title: 'Prestataires en attente',
      },
    },
    {
      path: '/partenaires/:id',
      name: 'partenaires.detail',
      component: () => import('../views/partenaires/detail.vue'),
      meta: {
        title: 'Detail Prestataire',
      },
    },
    {
      path: '/reservations',
      name: 'Reservations',
      component: () => import('../views/reservations/Reservations.vue'),
      meta: {
        title: 'Reservations',
      },
    },
    {
      path: '/reservations/:id',
      name: 'reservations.detail',
      component: () => import('../views/reservations/detail.vue'),
      meta: {
        title: 'Détail réservation',
      },
    },
    {
      path: '/listings',
      name: 'Listings',
      component: () => import('../views/listings/index.vue'),
      meta: {
        title: 'Listings',
      },
    },
    {
      path: '/listings/:category/:id',
      name: 'listings.detail',
      component: () => import('../views/listings/detail.vue'),
      meta: {
        title: 'Detail Listing',
      },
    },
    {
      path: '/clients',
      name: 'Clients',
      component: () => import('../views/clients/index.vue'),
      meta: {
        title: 'Clients',
      },
    },
    {
      path: '/clients/:id',
      name: 'clients.detail',
      component: () => import('../views/clients/detail.vue'),
      meta: {
        title: 'Detail Client',
      },
    },
    {
      path: '/quality/client-reviews',
      name: 'quality.client-reviews',
      component: () => import('../views/avis-qualite/client-reviews/index.vue'),
      meta: {
        title: 'Clients Review',
      },
    },
    {
      path: '/quality/review-moderation',
      name: 'quality.review-moderation',
      component: () => import('../views/avis-qualite/review-moderation/index.vue'),
      meta: {
        title: 'Review Moderation',
      },
    },
    {
      path: '/quality/provider-reports',
      name: 'quality.provider-reports',
      component: () => import('../views/avis-qualite/provider-reports/index.vue'),
      meta: {
        title: 'Provider Reports',
      },
    },
    {
      path: '/quality/provider-reports/reply',
      name: 'quality.provider-reports.reply',
      component: () => import('../views/avis-qualite/provider-reports/reply/index.vue'),
      meta: {
        title: 'Reply Provider Report',
      },
    },
    {
      path: '/finance/payments',
      name: 'finance.payments',
      component: () => import('../views/paiements-finance/list/index.vue'),
      meta: {
        title: 'Liste des paiements',
      },
    },
    {
      path: '/finance/payouts',
      name: 'finance.payouts',
      component: () => import('../views/paiements-finance/payouts/index.vue'),
      meta: {
        title: 'Payouts',
      },
    },
    {
      path: '/finance/partner-transactions',
      name: 'finance.partner-transactions',
      component: () => import('../views/paiements-finance/partner-transactions/index.vue'),
      meta: {
        title: 'Transactions partenaires',
      },
    },
    {
      path: '/finance/invoice-details',
      name: 'finance.invoice-details',
      component: () => import('../views/paiements-finance/invoice-details/index.vue'),
      meta: {
        title: 'Invoice details',
      },
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'Profile',
      },
    },
    {
      path: '/form-elements',
      name: 'Form Elements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: {
        title: 'Form Elements',
      },
    },
    {
      path: '/basic-tables',
      name: 'Basic Tables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'Basic Tables',
      },
    },
    {
      path: '/line-chart',
      name: 'Line Chart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
    },
    {
      path: '/bar-chart',
      name: 'Sponsoring',
      component: () => import('../views/Chart/Sponsoring/Sponsoring.vue'),
      meta: {
        title: 'Sponsoring',
      },
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts',
      },
    },
    {
      path: '/ticket-supports',
      name: 'Ticket Supports',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Ticket Supports',
      },
    },
    {
      path: '/avatars',
      redirect: '/ticket-supports',
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badge',
      },
    },

    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons',
      },
    },

    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images',
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos',
      },
    },
    {
      path: '/blank',
      name: 'Blank',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: {
        title: 'Blank',
      },
    },

    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },

    {
      path: '/settings/general',
      name: 'settings.general',
      component: () => import('../views/settings/general/index.vue'),
      meta: {
        title: 'Configuration generale',
      },
    },
    {
      path: '/settings/permissions',
      name: 'settings.permissions',
      component: () => import('../views/settings/permissions/index.vue'),
      meta: {
        title: 'Permissions',
      },
    },
    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
        public: true,
      },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/settings/admin-roles/index.vue'),
      meta: {
        title: 'Admins & Roles',
      },
    },
  ],
})

export default router

router.beforeEach(async (to, from, next) => {
  document.title = `${to.meta.title} - Nessia`

  const isPublicRoute = PUBLIC_PATHS.has(to.path) || to.meta.public === true

  if (isPublicRoute) {
    if (to.path === '/signin') {
      const granted = await hasRouteAccess()
      if (granted) {
        next('/')
        return
      }
    }

    next()
    return
  }

  try {
    if (auth.currentUser && isSessionExpired()) {
      await signOut(auth)
      authorizedUid = null
      next({ path: '/signin', query: { redirect: to.fullPath, error: 'session_expired' } })
      return
    }

    const granted = await hasRouteAccess()
    if (granted) {
      markSessionActivity()
      next()
      return
    }

    next({ path: '/signin', query: { redirect: to.fullPath, error: 'unauthorized' } })
    return
  } catch {
    authorizedUid = null
    next({ path: '/signin', query: { redirect: to.fullPath, error: 'unauthorized' } })
    return
  }
})
