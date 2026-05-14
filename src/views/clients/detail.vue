<template>
  <admin-layout>
    <page-breadcrumb :page-title="customer ? displayName(customer) : 'Detail client'" />

    <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
      Chargement...
    </div>

    <div v-else-if="error" class="rounded-2xl border border-error-200 bg-error-50 p-6 text-center text-sm text-error-700">
      {{ error }}
    </div>

    <div v-else-if="customer" class="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div class="space-y-4 xl:col-span-8">
        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Infos client</h3>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs text-gray-500">Nom</p>
              <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ displayName(customer) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Email</p>
              <p class="text-sm text-gray-700 dark:text-gray-200">{{ customer.email || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Telephone</p>
              <p class="text-sm text-gray-700 dark:text-gray-200">{{ customer.phone || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Ville</p>
              <p class="text-sm text-gray-700 dark:text-gray-200">{{ customer.city || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Langue</p>
              <p class="text-sm text-gray-700 dark:text-gray-200">{{ customer.language || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Cree le</p>
              <p class="text-sm text-gray-700 dark:text-gray-200">{{ formatDate(customer.createdAt) }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Reservations</h3>

          <div v-if="reservationDetailItems.length === 0" class="text-sm text-gray-500">Aucune reservation.</div>

          <div v-else class="space-y-3">
            <div v-for="reservation in reservationDetailItems" :key="reservation.id" class="rounded-xl border border-gray-100 p-4">
              <div class="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 class="text-sm font-semibold text-gray-800 dark:text-white">{{ reservation.elementTitre }}</h4>
                  <p class="text-xs text-gray-500">{{ reservation.reference || reservation.id }}</p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-700">{{ reservation.type }}</span>
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="reservationStatusBadgeClass(reservation.status)">{{ reservation.status }}</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 text-sm md:grid-cols-3 xl:grid-cols-6">
                <div>
                  <p class="text-xs text-gray-500">Montant</p>
                  <p class="font-semibold text-gray-800 dark:text-white">{{ formatCurrency(reservation.montantTotal, reservation.devise) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Paye</p>
                  <p class="font-semibold text-gray-800 dark:text-white">{{ formatCurrency(reservation.paidAmount, reservation.devise) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Reste</p>
                  <p class="text-gray-700 dark:text-gray-200">{{ formatCurrency(reservation.remainingAmount, reservation.devise) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Ville</p>
                  <p class="text-gray-700 dark:text-gray-200">{{ reservation.ville || '—' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Date debut</p>
                  <p class="text-gray-700 dark:text-gray-200">{{ formatDate(reservation.dateDebut) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Creee le</p>
                  <p class="text-gray-700 dark:text-gray-200">{{ formatDate(reservation.createdAt) }}</p>
                </div>
              </div>

              <button
                type="button"
                class="mt-3 flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
                @click="toggleReservationPayments(reservation.id)"
              >
                <span>Paiements lies ({{ reservation.payments.length }})</span>
                <span>{{ expandedReservationPayments[reservation.id] ? 'Masquer' : 'Afficher' }}</span>
              </button>

              <div v-if="expandedReservationPayments[reservation.id]" class="mt-3 space-y-2">
                <div v-if="reservation.payments.length === 0" class="text-sm text-gray-500">Aucun paiement lie.</div>
                <div
                  v-for="payment in reservation.payments"
                  :key="payment.id"
                  class="flex flex-col justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 md:flex-row md:items-center"
                >
                  <div>
                    <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ payment.reference || payment.id || '—' }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(payment.dateCreation) }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatCurrency(payment.montant, payment.devise) }}</span>
                    <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="paymentBadgeClass(payment.statut)">{{ payment.statut }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Paiements</h3>
          <div class="overflow-x-auto rounded-xl border border-gray-100">
            <table class="min-w-full divide-y divide-gray-100">
              <thead>
                <tr class="bg-gray-50">
                  <th class="th">Reference</th>
                  <th class="th">Montant</th>
                  <th class="th">Statut</th>
                  <th class="th">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-if="paiements.length === 0">
                  <td colspan="4" class="px-3 py-6 text-center text-sm text-gray-500">Aucun paiement.</td>
                </tr>
                <tr v-for="paiement in paiements" :key="paiement.id">
                  <td class="px-3 py-3 text-sm font-semibold text-gray-800 dark:text-white">{{ paiement.reference || paiement.id || '—' }}</td>
                  <td class="px-3 py-3 text-sm text-gray-700">{{ formatCurrency(paiement.montant, paiement.devise) }}</td>
                  <td class="px-3 py-3"><span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="paymentBadgeClass(paiement.statut)">{{ paiement.statut }}</span></td>
                  <td class="px-3 py-3 text-sm text-gray-600">{{ formatDate(paiement.dateCreation) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">Avis</h3>
          <div class="overflow-x-auto rounded-xl border border-gray-100">
            <table class="min-w-full divide-y divide-gray-100">
              <thead>
                <tr class="bg-gray-50">
                  <th class="th">Auteur</th>
                  <th class="th">Note</th>
                  <th class="th">Commentaire</th>
                  <th class="th">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-if="reviews.length === 0">
                  <td colspan="4" class="px-3 py-6 text-center text-sm text-gray-500">Aucun avis.</td>
                </tr>
                <tr v-for="review in reviews" :key="review.id">
                  <td class="px-3 py-3 text-sm font-semibold text-gray-800 dark:text-white">{{ review.userName || '—' }}</td>
                  <td class="px-3 py-3 text-sm text-gray-700">{{ review.rating }}/5</td>
                  <td class="px-3 py-3 text-sm text-gray-700">{{ review.comment || '—' }}</td>
                  <td class="px-3 py-3 text-sm text-gray-600">{{ formatDate(review.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="space-y-4 xl:col-span-4">
        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-lg font-semibold text-brand-600">
              {{ initials(customer) }}
            </div>
            <div>
              <p class="text-base font-semibold text-gray-800 dark:text-white">{{ displayName(customer) }}</p>
              <p class="text-sm text-gray-500">{{ customer.email || '—' }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-xs uppercase tracking-wide text-gray-500">Reservations</p>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{{ reservations.length }}</p>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-xs uppercase tracking-wide text-gray-500">Depenses confirmees</p>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{{ totalSpending }}</p>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-xs uppercase tracking-wide text-gray-500">Note moyenne</p>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{{ ratingLabel(customer) }}</p>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-xs uppercase tracking-wide text-gray-500">Avis</p>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{{ reviews.length }}</p>
        </div>
      </div>
    </div>

    <div v-else class="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
      Client introuvable.
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import {
  toClientReservationDetailItem,
  type ClientReservationDetailItem,
  type Reservation,
} from '~/models/reservations'
import {
  getCustomer,
  getCustomerPaiements,
  getCustomerReservations,
  getCustomerReviews,
} from '~/services/customers'
import type { Customer, Paiement, Review } from '~/types'

defineOptions({ name: 'ClientDetailPage' })

const route = useRoute()

const customer = ref<Customer | null>(null)
const reservations = ref<Reservation[]>([])
const paiements = ref<Paiement[]>([])
const reviews = ref<Review[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const expandedReservationPayments = ref<Record<string, boolean>>({})

const reservationDetailItems = computed<ClientReservationDetailItem[]>(() => {
  return reservations.value.map((reservation) => toClientReservationDetailItem(reservation, paiements.value))
})

const toggleReservationPayments = (reservationId: string) => {
  expandedReservationPayments.value[reservationId] = !expandedReservationPayments.value[reservationId]
}

onMounted(async () => {
  try {
    const customerId = String(route.params.id || '')
    if (!customerId) return

    const foundCustomer = await getCustomer(customerId)
    customer.value = foundCustomer

    if (!foundCustomer) return

    const [customerReservations, customerPaiements, customerReviews] = await Promise.all([
      getCustomerReservations(customerId, foundCustomer.uid),
      getCustomerPaiements(customerId),
      getCustomerReviews(customerId),
    ])

    reservations.value = customerReservations
    paiements.value = customerPaiements
    reviews.value = customerReviews
  } catch {
    error.value = 'Impossible de charger le detail du client.'
  } finally {
    loading.value = false
  }
})

const displayName = (item: Customer) => {
  if (item.name) return item.name
  return `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || '—'
}

const initials = (item: Customer) => {
  const firstName = item.firstName || item.name?.split(' ')[0] || '?'
  const lastName = item.lastName || item.name?.split(' ')[1] || ''
  return (firstName[0] + (lastName[0] || '')).toUpperCase()
}

const ratingLabel = (item: Customer) => {
  const stats = item.stats
  if (!stats) return '—'

  const totalReviews = stats.totalReviews ?? 0
  const average = totalReviews > 0
    ? Number(((stats.ratingSum ?? 0) / totalReviews).toFixed(1))
    : Number(stats.rating ?? 0)

  return average > 0 ? `${average}/5` : '—'
}

const formatDate = (value?: { seconds?: number } | Date | null) => {
  if (!value) return '—'
  if (value instanceof Date) {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(value)
  }
  if (!value.seconds) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value.seconds * 1000))
}

const formatCurrency = (amount?: number, currency = 'MAD') => {
  if (!amount) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const paymentBadgeClass = (status?: string) => {
  if (status === 'confirmed' || status === 'paid') return 'bg-success-50 text-success-600'
  if (status === 'pending') return 'bg-warning-50 text-warning-600'
  if (status === 'failed' || status === 'cancelled' || status === 'refunded') return 'bg-error-50 text-error-600'
  return 'bg-gray-100 text-gray-600'
}

const reservationStatusBadgeClass = (status?: string) => {
  if (status === 'confirmee') return 'bg-success-50 text-success-600'
  if (status === 'pending') return 'bg-warning-50 text-warning-600'
  if (status === 'annulee' || status === 'refunded') return 'bg-error-50 text-error-600'
  return 'bg-gray-100 text-gray-600'
}

const totalSpending = computed(() => {
  if (!customer.value) return '—'

  const total = paiements.value
    .filter((payment) => payment.statut === 'confirmed')
    .reduce((sum, payment) => sum + Number(payment.montant ?? 0), 0)

  return formatCurrency(total, customer.value.currency || 'MAD')
})
</script>
