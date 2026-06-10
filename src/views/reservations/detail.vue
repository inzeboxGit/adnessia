<template>
  <admin-layout>
    <page-breadcrumb page-title="Détail réservation" />

    <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
      Chargement...
    </div>

    <div v-else-if="error" class="rounded-2xl border border-error-200 bg-error-50 p-6 text-center text-sm text-error-700">
      {{ error }}
    </div>

    <div v-else-if="reservation" class="space-y-4">
      <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="flex flex-wrap items-start gap-4">
          <div v-if="image" class="h-28 w-28 overflow-hidden rounded-lg bg-gray-100">
            <img :src="image" :alt="reservation.elementTitre || reservation.reference" class="h-full w-full object-cover" />
          </div>

          <div class="flex-1">
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                @click="handleBack"
              >
                Retour aux réservations
              </button>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ reservation.elementTitre || reservation.reference || 'Réservation' }}</h3>
              <span class="rounded-full border px-2 py-0.5 text-xs" :class="categoryBadgeClass(reservation.type)">{{ reservation.type }}</span>
              <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusBadgeClass(reservation.status)">{{ statusLabel(reservation.status) }}</span>
            </div>

            <p class="text-xs text-gray-500">ID: {{ reservation.id }}</p>
            <p class="text-xs text-gray-500">Référence: {{ reservation.reference || '—' }}</p>

            <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div><p class="text-xs text-gray-500">Client</p><p class="text-sm font-semibold text-gray-800 dark:text-white">{{ clientName }}</p></div>
              <div><p class="text-xs text-gray-500">Prestataire</p><p class="text-sm font-semibold text-gray-800 dark:text-white">{{ providerName }}</p></div>
              <div><p class="text-xs text-gray-500">Ville</p><p class="text-sm font-semibold text-gray-800 dark:text-white">{{ reservation.ville || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Date début</p><p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatDateTime(reservation.dateDebut) }}</p></div>
              <div><p class="text-xs text-gray-500">Date fin</p><p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatDateTime(reservation.dateFin) }}</p></div>
              <div><p class="text-xs text-gray-500">Créée le</p><p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatDateTime(reservation.createdAt) }}</p></div>
              <div><p class="text-xs text-gray-500">Paiement</p><p class="text-sm font-semibold text-gray-800 dark:text-white">{{ reservation.paiementComplete ? 'Complet' : 'En attente' }}</p></div>
              <div><p class="text-xs text-gray-500">Montant total</p><p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatCurrency(reservation.montantTotal, reservation.devise) }}</p></div>
              <div><p class="text-xs text-gray-500">Montant avancé</p><p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatCurrency(reservation.montantAvance, reservation.devise) }}</p></div>
              <div><p class="text-xs text-gray-500">Montant restant</p><p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatCurrency(reservation.montantRestant, reservation.devise) }}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Paiements liés</h4>
        <div v-if="payments.length" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Référence</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Montant</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Méthode</th>
                <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="payment in payments" :key="payment.id">
                <td class="px-3 py-3 text-sm text-gray-700">{{ payment.reference || payment.id || '—' }}</td>
                <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ formatCurrency(payment.montant, payment.devise || reservation.devise) }}</td>
                <td class="px-3 py-3 text-sm text-gray-600">{{ payment.methodePaiement || '—' }}</td>
                <td class="px-3 py-3"><span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="paymentStatusBadgeClass(payment.statut)">{{ payment.statut }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-sm text-gray-500">Aucun paiement lié.</p>
      </section>

      <template v-if="reservation.type === 'ACTIVITE' && activityReservation">
        <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Détail activité</h4>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div><p class="text-xs text-gray-500">Titre</p><p class="text-sm font-semibold">{{ activityReservation.elementTitre || activityReservation.detailsSpecifiques?.activite_nom || '—' }}</p></div>
            <div><p class="text-xs text-gray-500">Heure</p><p class="text-sm font-semibold">{{ activityReservation.heure || '—' }}</p></div>
            <div><p class="text-xs text-gray-500">Participants</p><p class="text-sm font-semibold">{{ activityReservation.detailsSpecifiques?.participants ?? activityReservation.personnes ?? '—' }}</p></div>
            <div><p class="text-xs text-gray-500">Prix / personne</p><p class="text-sm font-semibold">{{ formatCurrency(activityReservation.detailsSpecifiques?.prix_par_personne, activityReservation.devise) }}</p></div>
          </div>
          <div class="mt-4 overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Item</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Heure</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Personnes</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Prix</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="(item, index) in activityReservation.items || []" :key="`${item.productId || index}`">
                  <td class="px-3 py-3 text-sm text-gray-700">{{ item.titre || '—' }}</td>
                  <td class="px-3 py-3 text-sm text-gray-600">{{ formatDateTime(item.date) }}</td>
                  <td class="px-3 py-3 text-sm text-gray-600">{{ item.heure || '—' }}</td>
                  <td class="px-3 py-3 text-sm text-gray-600">{{ item.personnes ?? '—' }}</td>
                  <td class="px-3 py-3 text-sm text-gray-600">{{ formatCurrency(item.prixParPersonne, activityReservation.devise) }}</td>
                  <td class="px-3 py-3 text-sm font-semibold text-gray-700">{{ formatCurrency(item.total, activityReservation.devise) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>

      <template v-else-if="reservation.type === 'HEBERGEMENT' && hebergementReservation">
        <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Détail hébergement</h4>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div><p class="text-xs text-gray-500">Hébergement</p><p class="text-sm font-semibold">{{ hebergementReservation.elementTitre || '—' }}</p></div>
            <div><p class="text-xs text-gray-500">Adultes</p><p class="text-sm font-semibold">{{ hebergementReservation.detailsSpecifiques?.adultes ?? '—' }}</p></div>
            <div><p class="text-xs text-gray-500">Enfants</p><p class="text-sm font-semibold">{{ hebergementReservation.detailsSpecifiques?.enfants ?? '—' }}</p></div>
            <div><p class="text-xs text-gray-500">Nuits</p><p class="text-sm font-semibold">{{ hebergementReservation.nbNuits ?? '—' }}</p></div>
            <div><p class="text-xs text-gray-500">Prix nuit</p><p class="text-sm font-semibold">{{ formatCurrency(hebergementReservation.detailsSpecifiques?.produits?.prixNuit || hebergementReservation.detailsSpecifiques?.prixNuit, hebergementReservation.devise) }}</p></div>
            <div><p class="text-xs text-gray-500">Options</p><p class="text-sm font-semibold">{{ enabledOptions(hebergementReservation.detailsSpecifiques?.options).join(', ') || '—' }}</p></div>
          </div>
        </section>
      </template>

      <template v-else-if="reservation.type === 'LOCATION_VOITURE' && carReservation">
        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Détail véhicule</h4>
            <div class="grid grid-cols-2 gap-3">
              <div><p class="text-xs text-gray-500">Véhicule</p><p class="text-sm font-semibold">{{ carReservation.detailsSpecifiques?.catalogue_nom || carReservation.elementTitre || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Référence véhicule</p><p class="text-sm font-semibold">{{ carReservation.vehiculeRef || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Carburant</p><p class="text-sm font-semibold">{{ carReservation.detailsSpecifiques?.carburant || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Transmission</p><p class="text-sm font-semibold">{{ carReservation.detailsSpecifiques?.transmission || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Places</p><p class="text-sm font-semibold">{{ carReservation.detailsSpecifiques?.places ?? '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Portes</p><p class="text-sm font-semibold">{{ carReservation.detailsSpecifiques?.portes ?? '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Prix journalier</p><p class="text-sm font-semibold">{{ formatCurrency(carReservation.detailsSpecifiques?.prix_journalier, carReservation.devise) }}</p></div>
              <div><p class="text-xs text-gray-500">Caution</p><p class="text-sm font-semibold">{{ formatCurrency(carReservation.detailsSpecifiques?.caution, carReservation.devise) }}</p></div>
              <div><p class="text-xs text-gray-500">Ville départ</p><p class="text-sm font-semibold">{{ carReservation.ville_depart || carReservation.detailsSpecifiques?.ville_depart || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Ville retour</p><p class="text-sm font-semibold">{{ carReservation.ville_retour || carReservation.detailsSpecifiques?.ville_retour || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Nb jours</p><p class="text-sm font-semibold">{{ carReservation.nbJours ?? '—' }}</p></div>
              <div><p class="text-xs text-gray-500">2ème conducteur</p><p class="text-sm font-semibold">{{ carReservation.deuxiemeConducteur ? 'Oui' : 'Non' }}</p></div>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Conducteur principal</h4>
            <div class="grid grid-cols-2 gap-3">
              <div><p class="text-xs text-gray-500">Nom</p><p class="text-sm font-semibold">{{ carReservation.conducteur_principal?.nom || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Prénom</p><p class="text-sm font-semibold">{{ carReservation.conducteur_principal?.prenom || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Email</p><p class="text-sm font-semibold">{{ carReservation.conducteur_principal?.email || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Téléphone</p><p class="text-sm font-semibold">{{ carReservation.conducteur_principal?.telephone || '—' }}</p></div>
            </div>
            <div class="mt-4">
              <p class="mb-2 text-xs text-gray-500">Options</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="item in carOptions" :key="item" class="rounded-full border border-success-200 bg-success-50 px-2 py-1 text-xs text-success-700">{{ item }}</span>
                <span v-if="!carOptions.length" class="text-sm text-gray-500">—</span>
              </div>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-2">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Documents</h4>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <a v-for="doc in carDocuments" :key="doc.label" :href="doc.url" target="_blank" rel="noopener noreferrer" class="rounded-xl border border-gray-200 p-3 text-sm text-gray-700 hover:bg-gray-50">
                <p class="font-semibold">{{ doc.label }}</p>
                <p class="text-xs text-gray-500">{{ doc.type || 'Document' }}</p>
              </a>
              <p v-if="!carDocuments.length" class="text-sm text-gray-500">Aucun document disponible.</p>
            </div>
          </section>
        </div>
      </template>

      <template v-else-if="reservation.type === 'VTC' && vtcReservation">
        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Trajet</h4>
            <div class="grid grid-cols-1 gap-3">
              <div><p class="text-xs text-gray-500">Départ</p><p class="text-sm font-semibold">{{ vtcReservation.origin?.address || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Destination</p><p class="text-sm font-semibold">{{ vtcReservation.destination?.address || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Distance</p><p class="text-sm font-semibold">{{ vtcReservation.destination?.distance || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Heure prise</p><p class="text-sm font-semibold">{{ vtcReservation.heurePrise || '—' }}</p></div>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Course VTC</h4>
            <div class="grid grid-cols-2 gap-3">
              <div><p class="text-xs text-gray-500">Passagers</p><p class="text-sm font-semibold">{{ vtcReservation.passengers ?? '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Aller simple</p><p class="text-sm font-semibold">{{ vtcReservation.isAllerSimple ? 'Oui' : 'Non' }}</p></div>
              <div><p class="text-xs text-gray-500">Arrivée estimée</p><p class="text-sm font-semibold">{{ formatDateTime(vtcReservation.estimatedArrival) }}</p></div>
              <div><p class="text-xs text-gray-500">Véhicule</p><p class="text-sm font-semibold">{{ vtcReservation.vehiculeId || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Driver ID</p><p class="text-sm font-semibold">{{ vtcReservation.driverId || '—' }}</p></div>
            </div>
          </section>
        </div>
      </template>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { getReservationDetailContext, type ReservationDetailContext } from '~/services/reservations'
import type { ActivityReservation, CarReservation, HebergementReservation, Reservation, ReservationDateValue, VtcReservation } from '~/models/reservations'
import type { Paiement } from '~/types'

defineOptions({ name: 'ReservationDetailPage' })

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const detail = ref<ReservationDetailContext | null>(null)

const reservation = computed<Reservation | null>(() => detail.value?.reservation || null)
const payments = computed<Paiement[]>(() => detail.value?.payments || [])
const image = computed(() => detail.value?.image || null)
const providerName = computed(() => detail.value?.providerName || '—')
const clientName = computed(() => detail.value?.clientName || '—')

const activityReservation = computed(() => reservation.value?.type === 'ACTIVITE' ? reservation.value as ActivityReservation : null)
const hebergementReservation = computed(() => reservation.value?.type === 'HEBERGEMENT' ? reservation.value as HebergementReservation : null)
const carReservation = computed(() => reservation.value?.type === 'LOCATION_VOITURE' ? reservation.value as CarReservation : null)
const vtcReservation = computed(() => reservation.value?.type === 'VTC' ? reservation.value as VtcReservation : null)

const carOptions = computed(() => {
  if (!carReservation.value) return []
  const list = [
    ...(carReservation.value.options || []),
    ...(carReservation.value.optionsSelectionnees || []),
    ...enabledOptions(carReservation.value.optionsExtras),
  ]
  return [...new Set(list.filter(Boolean))]
})

const carDocuments = computed(() => {
  if (!carReservation.value) return []
  const docs = carReservation.value.documents || {}
  return [
    { label: 'Pièce identité recto', url: docs.idDocRectoUrl || docs.idDocUrl, type: docs.idDocRectoType || docs.idDocType },
    { label: 'Pièce identité verso', url: docs.idDocVersoUrl, type: docs.idDocVersoType },
    { label: 'Permis recto', url: docs.licDocRectoUrl || docs.licDocUrl, type: docs.licDocRectoType || docs.licDocType },
    { label: 'Permis verso', url: docs.licDocVersoUrl, type: docs.licDocVersoType },
  ].filter((item) => item.url)
})

const toDate = (value?: ReservationDateValue) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && 'seconds' in value && typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000)
  }
  return null
}

const formatDateTime = (value?: ReservationDateValue) => {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatCurrency = (amount?: number | null, currency = 'MAD') => {
  if (amount == null) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const enabledOptions = (value?: Record<string, boolean>) => {
  if (!value) return []
  return Object.entries(value).filter(([, enabled]) => enabled).map(([key]) => key)
}

const statusLabel = (status: string) => {
  if (status === 'confirmee') return 'Confirmée'
  if (status === 'pending') return 'En attente'
  if (status === 'annulee') return 'Annulée'
  if (status === 'refunded') return 'Remboursée'
  return status
}

const statusBadgeClass = (status: string) => {
  if (status === 'confirmee') return 'bg-success-50 text-success-600'
  if (status === 'pending') return 'bg-warning-50 text-warning-600'
  if (status === 'annulee' || status === 'refunded') return 'bg-error-50 text-error-600'
  return 'bg-gray-100 text-gray-600'
}

const paymentStatusBadgeClass = (status?: string) => {
  if (status === 'confirmed' || status === 'paid') return 'bg-success-50 text-success-600'
  if (status === 'pending') return 'bg-warning-50 text-warning-600'
  if (status === 'cancelled' || status === 'refunded' || status === 'failed') return 'bg-error-50 text-error-600'
  return 'bg-gray-100 text-gray-600'
}

const categoryBadgeClass = (category: string) => {
  const value = category.toLowerCase()
  if (value.includes('hebergement')) return 'bg-blue-light-50 text-blue-light-600 border-blue-light-100'
  if (value.includes('activit')) return 'bg-warning-50 text-warning-600 border-warning-100'
  if (value.includes('location')) return 'bg-success-50 text-success-600 border-success-100'
  if (value.includes('vtc')) return 'bg-brand-50 text-brand-600 border-brand-100'
  return 'bg-gray-100 text-gray-600 border-gray-200'
}

const handleBack = () => {
  router.push({ name: 'Reservations' })
}

onMounted(async () => {
  try {
    const id = String(route.params.id || '')
    if (!id) throw new Error('Réservation introuvable.')
    detail.value = await getReservationDetailContext(id)
    if (!detail.value) throw new Error('Réservation introuvable.')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Impossible de charger la réservation.'
  } finally {
    loading.value = false
  }
})
</script>
