<template>
  <admin-layout>
    <div class="space-y-6">
      <section>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Tableau de bord</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Vue d'ensemble de votre plateforme et des activites en temps reel.</p>
      </section>

      <section class="flex justify-end">
        <div class="w-fit rounded-2xl bg-gray-100 p-1.5 dark:bg-white/[0.04]">
          <div class="grid grid-cols-3 gap-1">
          <button
            v-for="period in periods"
            :key="period.value"
            type="button"
            class="min-w-[110px] rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            :class="selectedPeriod === period.value
              ? 'bg-white text-gray-900 shadow-sm dark:bg-white/[0.12] dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
            @click="selectedPeriod = period.value"
          >
            {{ period.label }}
          </button>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <router-link
          v-for="card in topStats"
          :key="card.title"
:to="card.to"
          class="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-blue-700"
        >
          <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border" :style="iconBadgeStyle(card.iconColor)">
            <component :is="card.icon" class="h-5 w-5" :style="{ color: card.iconColor }" />
          </div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ card.title }}</p>
          <div class="mt-2 flex items-center gap-2">
            <p class="text-1xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {{ stripMad(card.value) }}
              <span v-if="hasMad(card.value)" class="ml-1 align-middle text-sm font-medium text-gray-500 dark:text-gray-400">Dhs</span>
            </p>
            <span class="rounded-md px-1.5 py-0.5 text-xs font-semibold" :class="card.deltaClass">{{ card.delta }}</span>
          </div>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ card.caption }}</p>
        </router-link>
      </section>

      <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Alertes & actions requises</h2>
          <button class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" type="button">
            Voir toutes les alertes
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <article
            v-for="item in alerts"
            :key="item.title"
            class="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40"
          >
            <div class="mb-3 flex items-center gap-3">
              <span class="inline-flex h-10 w-10 items-center justify-center rounded-full border" :style="iconBadgeStyle(item.iconColor)">
                <component :is="item.icon" class="h-5 w-5" :style="{ color: item.iconColor }" />
              </span>
              <p class="text-2xl font-semibold leading-none text-gray-900 dark:text-white">{{ item.value }}</p>
            </div>
            <p class="text-base font-medium text-gray-700 dark:text-gray-200">{{ item.title }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.subtitle }}</p>
            <router-link :to="item.to" class="mt-4 inline-flex items-center gap-1 text-sm font-semibold" :class="item.linkClass">
              Voir
              <ArrowRight class="h-4 w-4" />
            </router-link>
          </article>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article class="rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Activite recente</h2>
          <ul class="mt-5 space-y-4">
            <li v-for="entry in activity" :key="entry.title" class="flex items-start justify-between gap-3">
              <router-link
                v-if="entry.kind === 'RESERVATION'"
                :to="{ name: 'reservations.detail', params: { id: entry.id } }"
                class="flex items-start gap-3"
              >
                <span class="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border" :style="iconBadgeStyle(activityColor(entry.kind))">
                  <component :is="activityIcon(entry.kind)" class="h-4 w-4" :style="{ color: activityColor(entry.kind) }" />
                </span>
                <div>
                  <p class="text-sm font-semibold text-gray-800 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-300">{{ entry.title }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ entry.subtitle }}</p>
                </div>
              </router-link>
              <div v-else class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg border" :style="iconBadgeStyle(activityColor(entry.kind))">
                  <component :is="activityIcon(entry.kind)" class="h-4 w-4" :style="{ color: activityColor(entry.kind) }" />
                </span>
                <div>
                  <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ entry.title }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ entry.subtitle }}</p>
                </div>
              </div>
              <span class="text-sm text-gray-400 dark:text-gray-500">{{ formatRelativeTime(entry.createdAt) }}</span>
            </li>
          </ul>
          <router-link to="/reservations"
            class="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Voir toute l'activite
            <ArrowRight class="h-4 w-4" />
          </router-link>
        </article>

        <article class="rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-7 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="mb-5 flex items-center justify-between gap-3">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Performance</h2>
            <button class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300" type="button">
              <CalendarDays class="h-4 w-4" />
              {{ periodLabel }}
            </button>
          </div>

          <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <article
              v-for="item in miniStats"
              :key="item.title"
              class="rounded-xl border border-gray-200 p-3 dark:border-gray-700"
            >
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ item.title }}</p>
              <div class="mt-2 flex items-center gap-2">
                <p class="text-1xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  {{ stripMad(item.value) }}
                  <span v-if="hasMad(item.value)" class="ml-1 align-middle text-sm font-medium text-gray-500 dark:text-gray-400">Dhs</span>
                </p>
                <span class="rounded-md px-1.5 py-0.5 text-xs font-semibold" :class="item.deltaClass">{{ item.delta }}</span>
              </div>
              <div class="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                <div class="h-full rounded-full bg-blue-500" :style="{ width: item.trend }" />
              </div>
            </article>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <h3 class="mb-3 text-base font-semibold text-gray-800 dark:text-gray-100">Top categories</h3>
              <ul class="space-y-3">
                <li v-for="row in topCategories" :key="row.label" class="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                  <span class="text-sm text-gray-600 dark:text-gray-300">{{ row.label }}</span>
                  <div class="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                    <div class="h-full rounded-full" :style="gradientBarStyle(row.percent)" />
                  </div>
                  <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ toPercent(row.percent) }}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 class="mb-3 text-base font-semibold text-gray-800 dark:text-gray-100">Top villes</h3>
              <ul class="space-y-3">
                <li v-for="row in topCities" :key="row.label" class="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                  <span class="text-sm text-gray-600 dark:text-gray-300">{{ row.label }}</span>
                  <div class="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                    <div class="h-full rounded-full" :style="gradientBarStyle(row.percent)" />
                  </div>
                  <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ toPercent(row.percent) }}</span>
                </li>
              </ul>
            </div>
          </div>
        </article>
      </section>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Component } from 'vue'
import {
  ArrowRight,
  CalendarDays,
  CalendarCheck,
  Wallet,
  Percent,
  ShieldAlert,
  UserRound,
  CalendarClock,
  BadgeDollarSign,
  Flag,
  FileWarning,
  MessageCircleWarning,
  ShoppingCart,
  Car,
  House,
  CarFront,
  PartyPopper,
  Megaphone,
} from 'lucide-vue-next'
import AdminLayout from '../components/layout/AdminLayout.vue'
import {
  getDashboardAlertStats,
  getDashboardHeadlineStats,
  getDashboardRecentActivity,
  getDashboardPerformanceStats,
  getDashboardSponsoringRevenueStats,
  getDashboardTopCategoriesByListings,
  getDashboardTopCitiesByListings,
  type DashboardDateFilter,
  type DashboardRecentActivityItem,
  type DashboardRecentActivityKind,
  type DashboardTopCategoryItem,
  type DashboardTopCityItem,
} from '~/services/dashboard'

defineOptions({ name: 'EcommerceDashboard' })

type DashboardPeriod = 'today' | 'week' | 'month'

const hasMad = (value: string) => /\Dhs$/i.test(value)
const stripMad = (value: string) => value.replace(/\Dhs$/i, '')
const toHexAlpha = (hex: string, alpha: string) => `${hex}${alpha}`
const iconBadgeStyle = (color: string) => ({
  backgroundColor: toHexAlpha(color, '1A'),
  borderColor: toHexAlpha(color, '40'),
})

const selectedPeriod = ref<DashboardPeriod>('week')
const periods: Array<{ label: string, value: DashboardPeriod }> = [
  { label: "Aujourd'hui", value: 'today' },
  { label: 'Cette semaine', value: 'week' },
  { label: 'Ce mois-ci', value: 'month' },
]

const periodLabel = computed(() => {
  if (selectedPeriod.value === 'today') return "Aujourd'hui"
  if (selectedPeriod.value === 'month') return '30 derniers jours'
  return '7 derniers jours'
})

const topStats = ref([

  {
    title: "Chiffre d'affaires",
    value: '25 680 Dhs',
    delta: '+12%',
    caption: "aujourd'hui",
    to: '/finance/payments',
    icon: Wallet,
    iconColor: '#EA580C',
    deltaClass: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  },
  {
    title: 'Commission Nessia',
    value: '4 256 Dhs',
    delta: '+14%',
    caption: "Aujourd'hui",
    to: '/finance/partner-transactions',
    icon: Percent,
    iconColor: '#7C3AED',
    deltaClass: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  },

  {
    title: 'Revenue Sponsoring',
    value: '0 Dhs',
    delta: '0%',
    caption: 'Paiements SPON- paid',
    to: '/bar-chart',
    icon: Megaphone,
    iconColor: '#E11D48',
    deltaClass: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  },

  // ------ 
  {
    title: "Reservations",
    value: '128',
    delta: '+18%',
    caption: 'vs hier',
    to: '/reservations',
    icon: CalendarCheck,
    iconColor: '#2563EB',
    deltaClass: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  },


  {
    title: 'Litiges ouverts',
    value: '7',
    delta: '+2',
    caption: 'A traiter',
    to: '/alerts',
    icon: ShieldAlert,
    iconColor: '#E11D48',
    deltaClass: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  },
  {
    title: 'Prestataires en attente',
    value: '23',
    delta: '+5',
    caption: 'A valider',
    to: '/partenaires?view=moderation',
    icon: UserRound,
    iconColor: '#CA8A04',
    deltaClass: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  },

])

const alerts = ref([
  {
    value: '12',
    title: 'Reservations en attente',
    subtitle: 'A voir',
    to: '/reservations',
    icon: CalendarClock,
    iconColor: '#F97316',
    linkClass: 'text-orange-600 hover:text-orange-700 dark:text-orange-300',
  },
  {
    value: '4',
    title: 'Remboursements',
    subtitle: 'A traiter',
    to: '/finance/payments',
    icon: BadgeDollarSign,
    iconColor: '#E11D48',
    linkClass: 'text-pink-600 hover:text-pink-700 dark:text-pink-300',
  },
  {
    value: '7',
    title: 'Listings signales',
    subtitle: 'A verifier',
    to: '/quality/provider-reports',
    icon: Flag,
    iconColor: '#CA8A04',
    linkClass: 'text-amber-600 hover:text-amber-700 dark:text-amber-300',
  },
  {
    value: '3',
    title: 'Documents expires',
    subtitle: 'Prestataires',
    to: '/documents',
    icon: FileWarning,
    iconColor: '#7C3AED',
    linkClass: 'text-violet-600 hover:text-violet-700 dark:text-violet-300',
  },
  {
    value: '5',
    title: 'Tickets support',
    subtitle: 'ouverts',
    to: '/ticket-supports',
    icon: MessageCircleWarning,
    iconColor: '#0284C7',
    linkClass: 'text-sky-600 hover:text-sky-700 dark:text-sky-300',
  },
])

const fallbackActivity: DashboardRecentActivityItem[] = [
  {
    title: 'Nouvelle reservation #RES-1847',
    subtitle: 'Hebergement a Marrakech',
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    kind: 'RESERVATION',
    id: 'fallback-res-1',
    sourceCollection: 'reservations',
  },
  {
    title: 'Nouvelle activite',
    subtitle: 'Quad Agafay - Marrakech',
    createdAt: new Date(Date.now() - 18 * 60 * 1000),
    kind: 'ACTIVITE',
    id: 'fallback-act-1',
    sourceCollection: 'activities',
  },
  {
    title: 'Nouveau hebergement',
    subtitle: 'Riad Dar Saada - Marrakech',
    createdAt: new Date(Date.now() - 32 * 60 * 1000),
    kind: 'HEBERGEMENT',
    id: 'fallback-heb-1',
    sourceCollection: 'hebergements',
  },
  {
    title: 'Nouvelle annonce location',
    subtitle: 'Clio 5 - Casablanca',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    kind: 'LOCATION_VOITURE',
    id: 'fallback-car-1',
    sourceCollection: 'vehicules_annonces',
  },
  {
    title: 'Nouveau sponsoring active',
    subtitle: 'Riad Dar Saada - Marrakech',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    kind: 'SPONSORING',
    id: 'fallback-sponsoring-1',
    sourceCollection: 'sponsor_campaigns',
  },
]

const activity = ref<DashboardRecentActivityItem[]>(fallbackActivity)

const fallbackTopCategories: DashboardTopCategoryItem[] = [
  { key: 'HEBERGEMENT', label: 'Hebergements', count: 45, percent: 45 },
  { key: 'LOCATION_VOITURE', label: 'Locations de voitures', count: 25, percent: 25 },
  { key: 'VTC', label: 'VTC', count: 18, percent: 18 },
  { key: 'ACTIVITE', label: 'Activites', count: 12, percent: 12 },
]

const fallbackTopCities: DashboardTopCityItem[] = [
  { label: 'Marrakech', count: 32, percent: 32 },
  { label: 'Casablanca', count: 28, percent: 28 },
  { label: 'Agadir', count: 16, percent: 16 },
  { label: 'Rabat', count: 12, percent: 12 },
  { label: 'Autres', count: 12, percent: 12 },
]

const topCategories = ref<DashboardTopCategoryItem[]>(fallbackTopCategories)
const topCities = ref<DashboardTopCityItem[]>(fallbackTopCities)

const toDate = (value: DashboardRecentActivityItem['createdAt']) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') return value.toDate()
  if (typeof value === 'object' && 'seconds' in value && typeof value.seconds === 'number') return new Date(value.seconds * 1000)
  return null
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)

const getPeriodRange = (period: DashboardPeriod) => {
  const now = new Date()
  const endDate = endOfDay(now)

  if (period === 'today') {
    const startDate = startOfDay(now)
    const previousDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    const previousStartDate = startOfDay(previousDate)
    const previousEndDate = endOfDay(previousDate)
    return { startDate, endDate, previousStartDate, previousEndDate }
  }

  const days = period === 'month' ? 30 : 7
  const startDate = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1)))
  const previousEndDate = endOfDay(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - 1))
  const previousStartDate = startOfDay(new Date(previousEndDate.getFullYear(), previousEndDate.getMonth(), previousEndDate.getDate() - (days - 1)))

  return { startDate, endDate, previousStartDate, previousEndDate }
}

const getDeltaPercent = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${value}%`

const deltaBadgeClass = (value: number) => {
  if (value > 0) return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
  if (value < 0) return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
}

const formatRelativeTime = (value: DashboardRecentActivityItem['createdAt']) => {
  const date = toDate(value)
  if (!date) return 'Date inconnue'

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Il y a ${diffHours} h`

  const diffDays = Math.floor(diffHours / 24)
  return `Il y a ${diffDays} j`
}

const activityIcon = (kind: DashboardRecentActivityKind): Component => {
  if (kind === 'RESERVATION') return ShoppingCart
  if (kind === 'HEBERGEMENT') return House
  if (kind === 'LOCATION_VOITURE') return Car
  if (kind === 'VTC') return CarFront
  if (kind === 'ACTIVITE') return PartyPopper
  if (kind === 'SPONSORING') return Megaphone
  return Megaphone
}

const activityColor = (kind: DashboardRecentActivityKind) => {
  if (kind === 'RESERVATION') return '#16A34A'
  if (kind === 'HEBERGEMENT') return '#34BBF7'
  if (kind === 'LOCATION_VOITURE') return '#56C42B'
  if (kind === 'VTC') return '#AB73FD'
  if (kind === 'ACTIVITE') return '#FF700C'
  if (kind === 'SPONSORING') return '#E11D48'
  return '#4F46E5'
}

const loadDashboardData = async () => {
  const { startDate, endDate, previousStartDate, previousEndDate } = getPeriodRange(selectedPeriod.value)
  const dateFilter: DashboardDateFilter = { startDate, endDate }
  const previousDateFilter: DashboardDateFilter = { startDate: previousStartDate, endDate: previousEndDate }

  try {
    const [
      activityItems,
      categoryItems,
      cityItems,
      performanceStats,
      previousPerformanceStats,
      alertStats,
      headlineStats,
      sponsoringStats,
      previousSponsoringStats,
    ] = await Promise.all([
      getDashboardRecentActivity(5, dateFilter),
      getDashboardTopCategoriesByListings(dateFilter),
      getDashboardTopCitiesByListings(5, dateFilter),
      getDashboardPerformanceStats(dateFilter),
      getDashboardPerformanceStats(previousDateFilter),
      getDashboardAlertStats(),
      getDashboardHeadlineStats(dateFilter),
      getDashboardSponsoringRevenueStats(dateFilter),
      getDashboardSponsoringRevenueStats(previousDateFilter),
    ])

    if (activityItems.length) activity.value = activityItems.slice(0, 5)
    if (categoryItems.length) topCategories.value = categoryItems
    if (cityItems.length) topCities.value = cityItems

    alerts.value = [
      {
        ...alerts.value[0],
        value: formatCompactNumber(alertStats.pendingReservations),
      },
      alerts.value[1],
      {
        ...alerts.value[2],
        value: formatCompactNumber(alertStats.listingReports),
      },
      alerts.value[3],
      {
        ...alerts.value[4],
        value: formatCompactNumber(alertStats.supportTicketsOpen),
      },
    ]

    const reservationDelta = getDeltaPercent(performanceStats.reservationsCount, previousPerformanceStats.reservationsCount)
    const revenueDelta = getDeltaPercent(performanceStats.revenueMad, previousPerformanceStats.revenueMad)
    const providersDelta = getDeltaPercent(performanceStats.newProvidersCount, previousPerformanceStats.newProvidersCount)
    const confirmedTodayDelta = getDeltaPercent(
      headlineStats.reservationsConfirmedToday,
      headlineStats.reservationsConfirmedYesterday,
    )
    const commissionDelta = getDeltaPercent(headlineStats.commissionMad, headlineStats.revenuePreviousMad * (headlineStats.commissionRate / 100))
    const sponsoringDelta = getDeltaPercent(sponsoringStats.revenueMad, previousSponsoringStats.revenueMad)

    topStats.value = [
      {
        ...topStats.value[0],
        value: formatCompactNumber(headlineStats.reservationsConfirmedToday),
        delta: formatDelta(confirmedTodayDelta),
        deltaClass: deltaBadgeClass(confirmedTodayDelta),
        caption: "confirmed aujourd'hui",
      },
      {
        ...topStats.value[1],
        value: `${formatCompactNumber(performanceStats.revenueMad)} Dhs`,
        delta: formatDelta(revenueDelta),
        deltaClass: deltaBadgeClass(revenueDelta),
        caption: periodLabel.value.toLowerCase(),
      },
      {
        ...topStats.value[2],
        value: `${formatCompactNumber(headlineStats.commissionMad)} Dhs`,
        delta: formatDelta(commissionDelta),
        deltaClass: deltaBadgeClass(commissionDelta),
        caption: `taux ${headlineStats.commissionRate}%`,
      },
      {
        ...topStats.value[3],
        value: formatCompactNumber(headlineStats.openIncidents),
        delta: '0%',
        deltaClass: deltaBadgeClass(0),
        caption: 'Etat ouvert',
      },
      {
        ...topStats.value[4],
        value: formatCompactNumber(headlineStats.pendingProviders),
        delta: '0%',
        deltaClass: deltaBadgeClass(0),
        caption: 'Application En Attente',
      },
      {
        ...topStats.value[5],
        value: `${formatCompactNumber(sponsoringStats.revenueMad)} Dhs`,
        delta: formatDelta(sponsoringDelta),
        deltaClass: deltaBadgeClass(sponsoringDelta),
        caption: 'Paiements SPON- paid',
      },
    ]

    miniStats.value = [
      {
        title: 'Reservations',
        value: formatCompactNumber(performanceStats.reservationsCount),
        delta: formatDelta(reservationDelta),
        deltaClass: deltaBadgeClass(reservationDelta),
        trend: '82%',
      },
      {
        title: "Chiffre d'affaires",
        value: `${formatCompactNumber(performanceStats.revenueMad)} Dhs`,
        delta: formatDelta(revenueDelta),
        deltaClass: deltaBadgeClass(revenueDelta),
        trend: '76%',
      },
      {
        title: 'Taux de conversion',
        value: '7.6%',
        delta: '0%',
        deltaClass: deltaBadgeClass(0),
        trend: '74%',
      },
      {
        title: 'Nv prestataires',
        value: formatCompactNumber(performanceStats.newProvidersCount),
        delta: formatDelta(providersDelta),
        deltaClass: deltaBadgeClass(providersDelta),
        trend: '88%',
      },
    ]
  } catch {
    // Keep fallback visual entries when live data is unavailable.
  }
}

watch(selectedPeriod, () => {
  void loadDashboardData()
}, { immediate: true })

const miniStats = ref([
  {
    title: 'Reservations',
    value: '3 245',
    delta: '+15%',
    deltaClass: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    trend: '82%',
  },
  {
    title: "Chiffre d'affaires",
    value: '512 980 Dhs',
    delta: '+11%',
    deltaClass: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    trend: '76%',
  },
  {
    title: 'Taux de conversion',
    value: '7.6%',
    delta: '0%',
    deltaClass: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    trend: '74%',
  },
  {
    title: 'Nv prestataires',
    value: '86',
    delta: '+20%',
    deltaClass: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    trend: '88%',
  },
])

const toPercent = (value: number) => `${value}%`
const formatCompactNumber = (value: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)
const gradientBarStyle = (percent: number) => ({
  width: toPercent(percent),
  backgroundImage: 'linear-gradient(90deg, #38BDF8 0%, #34D399 55%, #22C55E 100%)',
})
</script>
