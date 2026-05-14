<template>
  <admin-layout>
    <page-breadcrumb page-title="Invoice details" />

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div class="xl:col-span-9">
        <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">Nessia Finance</p>
            </div>
            <div class="text-right">
              <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="invoiceStatusClass">{{ invoiceStatusLabel }}</span>
              <p class="mt-2 text-lg font-semibold text-gray-900 dark:text-white">Invoice #{{ invoiceId }}</p>
            </div>
          </div>

          <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p class="mb-2 text-xs uppercase tracking-wide text-gray-500">From</p>
              <p class="text-sm font-semibold text-gray-800 dark:text-white">Nessia Finance</p>
              <p class="text-sm text-gray-600">8 Boulevard Abdelmoumen, Casablanca</p>
              <p class="text-sm text-gray-600">support@nessia.com</p>
              <p class="mt-3 text-xs uppercase tracking-wide text-gray-500">Invoice Date</p>
              <p class="text-sm font-medium text-gray-700">{{ invoiceDate }}</p>
            </div>
            <div>
              <p class="mb-2 text-xs uppercase tracking-wide text-gray-500">To</p>
              <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ providerName }}</p>
              <p class="text-sm text-gray-600">{{ providerCity }}</p>
              <p class="text-sm text-gray-600">Reference: {{ referenceValue }}</p>
              <p class="mt-3 text-xs uppercase tracking-wide text-gray-500">Due Date</p>
              <p class="text-sm font-medium text-gray-700">{{ invoiceDate }}</p>
            </div>
          </div>

          <div class="overflow-x-auto rounded-xl border border-gray-100">
            <table class="min-w-full divide-y divide-gray-100">
              <thead>
                <tr class="bg-gray-50">
                  <th class="th">#</th>
                  <th class="th">Product details</th>
                  <th class="th">Qty</th>
                  <th class="th">Unit price</th>
                  <th class="th">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr>
                  <td class="px-3 py-3 text-sm text-gray-700">01</td>
                  <td class="px-3 py-3">
                    <p class="text-sm font-semibold text-gray-800 dark:text-white">Payout partenaire</p>
                    <p class="text-xs text-gray-500">({{ providerName }})</p>
                  </td>
                  <td class="px-3 py-3 text-sm text-gray-700">1</td>
                  <td class="px-3 py-3 text-sm text-gray-700">{{ formatCurrency(baseAmount, currency) }}</td>
                  <td class="px-3 py-3 text-sm text-gray-700">{{ formatCurrency(baseAmount, currency) }}</td>
                </tr>
                <tr>
                  <td class="px-3 py-3 text-sm text-gray-700">02</td>
                  <td class="px-3 py-3">
                    <p class="text-sm font-semibold text-gray-800 dark:text-white">Frais plateforme Nessia</p>
                    <p class="text-xs text-gray-500">({{ feeRate }}%)</p>
                  </td>
                  <td class="px-3 py-3 text-sm text-gray-700">1</td>
                  <td class="px-3 py-3 text-sm text-error-600">-{{ formatCurrency(feesAmount, currency) }}</td>
                  <td class="px-3 py-3 text-sm text-error-600">-{{ formatCurrency(feesAmount, currency) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4 flex justify-end">
            <table class="w-full max-w-md text-right text-sm">
              <tbody>
                <tr>
                  <td class="py-1 text-gray-500">Subtotal</td>
                  <td class="py-1 text-gray-700">{{ formatCurrency(baseAmount, currency) }}</td>
                </tr>
                <tr>
                  <td class="py-1 text-gray-500">Frais Nessia ({{ feeRate }}%)</td>
                  <td class="py-1 text-error-600">-{{ formatCurrency(feesAmount, currency) }}</td>
                </tr>
                <tr class="border-t border-gray-200">
                  <td class="py-2 text-base font-semibold text-gray-800 dark:text-white">Total</td>
                  <td class="py-2 text-base font-semibold text-gray-800 dark:text-white">{{ formatCurrency(netAmount, currency) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
            <p>Note: Transaction {{ invoiceId }} - Reference {{ referenceValue }} - Statut {{ invoiceStatusLabel }}.</p>
          </div>
        </div>
      </div>

      <div class="xl:col-span-3">
        <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="flex flex-col gap-2">
            <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700" @click="goBack">Retour</button>
            <button class="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white" @click="printInvoice">Print</button>
          </div>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'

defineOptions({ name: 'InvoiceDetailsPage' })

const route = useRoute()
const router = useRouter()

const queryString = (key: string, fallback = '') => {
  const raw = route.query[key]
  return typeof raw === 'string' && raw.trim() ? raw.trim() : fallback
}

const queryNumber = (key: string, fallback = 0) => {
  const value = Number(queryString(key, String(fallback)))
  return Number.isFinite(value) ? value : fallback
}

const invoiceId = computed(() => queryString('txId', 'INS-0120001'))
const providerName = computed(() => queryString('provider', 'Partenaire'))
const providerCity = computed(() => queryString('city', '—'))
const referenceValue = computed(() => queryString('reference', '—'))
const currency = computed(() => queryString('currency', 'MAD'))
const baseAmount = computed(() => queryNumber('base', 0))
const feesAmount = computed(() => queryNumber('fees', 0))
const feeRate = computed(() => queryNumber('feeRate', 20))
const netAmount = computed(() => queryNumber('net', Math.max(0, baseAmount.value - feesAmount.value)))

const rawStatus = computed(() => queryString('status', 'pending').toLowerCase())
const invoiceStatusLabel = computed(() => {
  if (rawStatus.value === 'paid') return 'Paid'
  if (rawStatus.value === 'failed') return 'Failed'
  if (rawStatus.value === 'cancelled') return 'Cancelled'
  return 'Pending'
})

const invoiceStatusClass = computed(() => {
  if (rawStatus.value === 'paid') return 'bg-success-50 text-success-600'
  if (rawStatus.value === 'failed') return 'bg-error-50 text-error-600'
  if (rawStatus.value === 'cancelled') return 'bg-gray-100 text-gray-600'
  return 'bg-warning-50 text-warning-600'
})

const invoiceDate = computed(() => {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())
})

const formatCurrency = (amount: number, c = 'MAD') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: c,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const goBack = async () => {
  await router.push('/finance/partner-transactions')
}

const printInvoice = () => {
  window.print()
}
</script>
