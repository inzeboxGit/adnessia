<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 md:gap-6">
    <div
      v-for="item in statistics"
      :key="item.title"
      class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
    >
      <div class="flex items-center justify-between">
        <span class="text-theme-sm font-medium text-gray-500 dark:text-gray-400">{{ item.title }}</span>
        <span class="rounded-lg px-2 py-1 text-theme-xs font-semibold" :class="item.badgeClass">
          {{ item.suffix || '' }}
        </span>
      </div>

      <div class="mt-3 text-title-sm font-bold text-gray-800 dark:text-white/90">
        {{ formatValue(item.value) }}<span v-if="item.unit" class="ml-1 text-base font-semibold">{{ item.unit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '~/config/firebase'
import {
  getCustomersCount,
  getDashboardRevenue,
  getPartnerPayoutTransactions,
  getReservationsConfirmeesCount,
  getSponsoringRevenue,
} from '~/services/paiements'
import { getCentralizedReservations } from '~/services/reservations'
import type { Agence, Customer } from '~/types'

type MetricCard = {
  title: string
  value: number
  unit?: string
  suffix?: string
  badgeClass: string
}

const statistics = ref<MetricCard[]>([])

const formatValue = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: Number.isInteger(value) ? 0 : 2 }).format(value)
}

onMounted(async () => {
  const getCustomerReviewsCount = async () => {
    const snap = await getDocs(collection(db, 'customers'))
    return snap.docs.reduce((sum, d) => {
      const stats = (d.data() as Customer).stats
      return sum + Number(stats?.totalReviews ?? 0)
    }, 0)
  }

  const getAgenceReviewsCount = async () => {
    const snap = await getDocs(collection(db, 'agences'))
    return snap.docs.reduce((sum, d) => {
      const stats = (d.data() as Agence).stats
      return sum + Number(stats?.totalReviews ?? 0)
    }, 0)
  }

  const [
    revenue,
    reservationsConfirmees,
    customersCount,
    customerReviewsCount,
    agenceReviewsCount,
    sponsoringRevenue,
    payoutTransactions,
    centralizedReservations,
  ] = await Promise.all([
    getDashboardRevenue(),
    getReservationsConfirmeesCount(),
    getCustomersCount(),
    getCustomerReviewsCount(),
    getAgenceReviewsCount(),
    getSponsoringRevenue(),
    getPartnerPayoutTransactions(),
    getCentralizedReservations(),
  ])

  const totalRevenueMontant = revenue.totals.reduce((acc, total) => acc + total.montant, 0)
  const totalRefunds = revenue.countByStatut.refunded + revenue.countByStatut.partially_refunded
  const nessiaCommissionFromPaidTransactions = payoutTransactions
    .filter((transaction) => transaction.status === 'paid')
    .reduce((sum, transaction) => sum + Number(transaction.feeAmount ?? 0), 0)

  const reservationCategoryCounts = {
    hebergements: 0,
    activites: 0,
    location: 0,
    vtc: 0,
  }

  for (const reservation of centralizedReservations) {
    const value = String(reservation.category || '').toUpperCase()
    if (value.includes('HEBERGEMENT')) reservationCategoryCounts.hebergements += 1
    else if (value.includes('ACTIVITE')) reservationCategoryCounts.activites += 1
    else if (value.includes('LOCATION')) reservationCategoryCounts.location += 1
    else if (value.includes('VTC')) reservationCategoryCounts.vtc += 1
  }

  const totalCategories = Object.values(reservationCategoryCounts).reduce((sum, count) => sum + (count > 0 ? 1 : 0), 0)

  statistics.value = [
    { title: 'Total ventes', value: totalRevenueMontant, unit: 'MAD', suffix: 'Live', badgeClass: 'bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300' },
    { title: 'Réservations confirmées', value: reservationsConfirmees, suffix: 'Live', badgeClass: 'bg-success-50 text-success-600 dark:bg-success-500/20 dark:text-success-300' },
    { title: 'Clients', value: customersCount, suffix: 'Live', badgeClass: 'bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/20 dark:text-blue-light-300' },
    { title: 'Remboursements', value: totalRefunds, suffix: 'Live', badgeClass: 'bg-warning-50 text-warning-600 dark:bg-warning-500/20 dark:text-warning-300' },
    { title: 'Avis Clients', value: customerReviewsCount, suffix: 'Live', badgeClass: 'bg-orange-50 text-orange-500 dark:bg-orange-500/20 dark:text-orange-300' },
    { title: 'Avis Providers', value: agenceReviewsCount, suffix: 'Live', badgeClass: 'bg-success-50 text-success-600 dark:bg-success-500/20 dark:text-success-300' },
    { title: 'Revenus Sponsoring', value: sponsoringRevenue, unit: 'MAD', suffix: 'Live', badgeClass: 'bg-error-50 text-error-600 dark:bg-error-500/20 dark:text-error-300' },
    { title: 'Commissions Nessia', value: nessiaCommissionFromPaidTransactions, unit: 'MAD', suffix: `Cat: ${totalCategories}`, badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  ]
})
</script>
