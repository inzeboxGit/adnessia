<template>
  <admin-layout>
    <page-breadcrumb :page-title="agence ? agencyName(agence) : 'Detail prestataire'" />

    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <router-link
        :to="{ path: '/opportunities' }"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <span aria-hidden="true">←</span>
        Retour a la liste
      </router-link>

      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="applicationStatusClass(agence?.applicationStatus)">
          {{ applicationStatusLabel(agence?.applicationStatus) }}
        </span>
        <span
          v-if="isPartnerVerified"
          class="rounded-full border border-info-200 bg-info-50 px-2.5 py-1 text-xs font-semibold text-info-700 dark:border-info-900/40 dark:bg-info-900/20 dark:text-info-300"
        >
          Partenaire verifie
        </span>
        <button
          type="button"
          class="rounded-lg bg-success-500 px-3 py-2 text-xs font-semibold text-white hover:bg-success-600"
          @click="openPartnerModerationModal('approved')"
        >
          Approuver le partenaire
        </button>
        <button
          type="button"
          class="rounded-lg bg-error-500 px-3 py-2 text-xs font-semibold text-white hover:bg-error-600"
          @click="openPartnerModerationModal('rejected')"
        >
          Rejeter
        </button>
      </div>
    </div>

    <div v-if="partnerActionError" class="mb-3 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/20 dark:text-error-300">
      {{ partnerActionError }}
    </div>
    <div v-if="partnerActionSuccess" class="mb-3 rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700 dark:border-success-900/40 dark:bg-success-900/20 dark:text-success-300">
      {{ partnerActionSuccess }}
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="item in 5" :key="item" class="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
    </div>

    <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
      {{ error }}
    </div>

    <div v-else-if="agence" class="space-y-6">
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-8">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Infos prestataire</h3>
          <div class="grid grid-cols-1 gap-4 text-sm text-gray-700 dark:text-gray-300 md:grid-cols-2">
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Agency Name</p>
              <p class="font-semibold">{{ agencyName(agence) }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Email</p>
              <p>{{ agence.email || '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Telephone</p>
              <p>{{ agence.telephone || '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Ville</p>
              <p>{{ agence.city || agence.ville || '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Host Status</p>
              <p>{{ agence.hostStatus || '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Application Status</p>
              <p>{{ agence.applicationStatus || '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Service Zones</p>
              <p>{{ agence.serviceZones || '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Cree le</p>
              <p>{{ formatDate(agence.createdAt) }}</p>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-4">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Profil prestataire</h3>
          <div class="mb-4 flex items-center gap-3">
            <div class="h-14 w-14 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <img v-if="agence.logo || agence.avatar" :src="agence.logo || agence.avatar" alt="logo" class="h-full w-full object-cover" />
              <div v-else class="flex h-full w-full items-center justify-center text-lg font-semibold text-brand-600">{{ initials(agence) }}</div>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ agencyName(agence) }}</h3>
              <p class="text-sm text-gray-500">{{ agence.email || '—' }}</p>
            </div>
          </div>

          <div class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">First name</p>
              <p class="font-semibold">{{ agence.firstName || '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Last name</p>
              <p class="font-semibold">{{ agence.lastName || '—' }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Adresse</p>
              <p>{{ providerAddress(agence) }}</p>
            </div>
            <div>
              <p class="mb-1 text-xs uppercase tracking-wide text-gray-500">Categories inscrit</p>
              <p>{{ categoriesInscrites(agence) }}</p>
            </div>
          </div>
        </article>
      </div>

      <article class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Documents prestataire</h3>
          <span class="text-xs text-gray-500">Validation individuelle avec motif</span>
        </div>

        <div v-if="documentError" class="mb-3 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/20 dark:text-error-300">
          {{ documentError }}
        </div>
        <div v-if="documentSuccess" class="mb-3 rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700 dark:border-success-900/40 dark:bg-success-900/20 dark:text-success-300">
          {{ documentSuccess }}
        </div>

        <div v-if="documentsList.length === 0" class="rounded-lg border border-dashed border-gray-300 px-3 py-5 text-sm text-gray-500 dark:border-gray-700">
          Aucun document disponible.
        </div>

        <div v-else class="space-y-3">
          <div v-for="item in documentsList" :key="item.key" class="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ item.label }}</p>
                <p class="text-xs text-gray-500">{{ item.name || item.path || 'Document' }}</p>
                <p class="text-xs text-gray-500">Type: {{ item.type || '—' }} | Taille: {{ item.size || '—' }}</p>
              </div>
              <span :class="documentStatusClass(item.validationStatus)">{{ documentStatusLabel(item.validationStatus) }}</span>
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-2">
              <a
                v-if="item.url"
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Voir document
              </a>

              <input
                v-model="documentReasons[item.key]"
                type="text"
                placeholder="Motif (obligatoire pour rejet)"
                class="min-w-[260px] flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              />

              <button
                type="button"
                class="rounded-lg bg-success-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-success-600 disabled:opacity-50"
                :disabled="isDocumentSaving(item.key)"
                @click="applyDocumentDecision(item.key, 'approved')"
              >
                Valider
              </button>

              <button
                type="button"
                class="rounded-lg bg-error-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-error-600 disabled:opacity-50"
                :disabled="isDocumentSaving(item.key)"
                @click="applyDocumentDecision(item.key, 'rejected')"
              >
                Rejeter
              </button>
            </div>

            <p v-if="item.validationReason" class="mt-2 text-xs text-gray-500">Motif actuel: {{ item.validationReason }}</p>
          </div>
        </div>
      </article>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-xs uppercase tracking-wide text-gray-500">Reservations</p>
          <p class="mt-2 text-2xl font-semibold text-brand-600">{{ reservations.length }}</p>
          <p class="mt-1 text-sm text-gray-500">Confirmee: {{ confirmedReservationsCount }} | Categories: {{ reservationCategoryCount }}</p>
        </article>

        <article class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-xs uppercase tracking-wide text-gray-500">Revenue confirme</p>
          <p class="mt-2 text-2xl font-semibold text-success-600">{{ totalRevenue }}</p>
          <div class="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
            <div class="h-full rounded-full bg-success-500" :style="{ width: `${confirmedPaymentsProgress}%` }" />
          </div>
          <p class="mt-1 text-sm text-gray-500">Taux confirme: {{ confirmedPaymentsProgress }}%</p>
        </article>

        <article class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-xs uppercase tracking-wide text-gray-500">Note moyenne</p>
          <p class="mt-2 text-2xl font-semibold text-warning-600">{{ ratingLabel(agence) }}</p>
        </article>

        <article class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p class="text-xs uppercase tracking-wide text-gray-500">Reviews</p>
          <p class="mt-2 text-2xl font-semibold text-info-600">{{ reviews.length }}</p>
        </article>
      </div>

      <article class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 text-sm font-medium"
              :class="activeTab === 'reservations' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'"
              @click="activeTab = 'reservations'"
            >
              Reservations ({{ reservations.length }})
            </button>
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 text-sm font-medium"
              :class="activeTab === 'paiements' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'"
              @click="activeTab = 'paiements'"
            >
              Paiements ({{ paiements.length }})
            </button>
            <button
              type="button"
              class="rounded-lg px-3 py-1.5 text-sm font-medium"
              :class="activeTab === 'reviews' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'"
              @click="activeTab = 'reviews'"
            >
              Reviews ({{ reviews.length }})
            </button>
          </div>

          <div v-if="activeTab === 'reservations'" class="space-y-2">
            <div class="overflow-x-auto pb-1">
              <div class="flex min-w-max flex-nowrap items-end gap-1.5">
                <div class="flex flex-col items-start gap-0.5">
                <span class="text-sm text-gray-500">Categorie</span>
                <select
                  v-model="reservationCategoryFilter"
                  class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option v-for="option in reservationCategoryOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
                </select>
                </div>

                <div class="flex flex-col items-start gap-0.5">
                <span class="text-sm text-gray-500">Status</span>
                <select
                  v-model="reservationStatusFilter"
                  class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option value="">Tous</option>
                  <option v-for="status in reservationStatusOptions" :key="status" :value="status">{{ status }}</option>
                </select>
                </div>

                <div class="flex flex-col items-start gap-0.5">
                <span class="text-sm text-gray-500">Ville</span>
                <input
                  v-model="reservationVilleFilter"
                  type="text"
                  placeholder="ex: Marrakech"
                  class="w-[170px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                />
                </div>

                <div class="flex flex-col items-start gap-0.5">
                <span class="text-sm text-gray-500">Afficher</span>
                <select
                  v-model.number="reservationPerPage"
                  class="w-[90px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                </div>

                <div class="flex flex-col items-start gap-0.5">
                <span class="text-sm text-gray-500">Revenue min</span>
                <input
                  v-model.number="reservationMinRevenue"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-[120px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                />
                </div>

                <div class="flex flex-col items-start gap-0.5">
                <span class="text-sm text-gray-500">Commission min</span>
                <input
                  v-model.number="reservationMinCommission"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-[130px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                />
                </div>

                <div class="flex flex-col items-start gap-0.5">
                <span class="text-sm text-gray-500">Date debut</span>
                <input
                  v-model="reservationDateFrom"
                  type="date"
                  class="w-[165px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                />
                </div>

                <div class="flex flex-col items-start gap-0.5">
                <span class="text-sm text-gray-500">Date fin</span>
                <input
                  v-model="reservationDateTo"
                  type="date"
                  class="w-[165px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                />
                </div>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                <thead>
                  <tr class="bg-gray-50 dark:bg-gray-900/40">
                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Categorie</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Reservations</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Revenue</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Commission</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-transparent">
                  <tr v-if="categorySummary.length === 0">
                    <td colspan="4" class="px-3 py-3 text-sm text-gray-500">Aucune categorie</td>
                  </tr>
                  <tr v-for="item in categorySummary" :key="item.category">
                    <td class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">{{ item.category }}</td>
                    <td class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">{{ item.count }}</td>
                    <td class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">{{ formatCurrency(item.revenue, defaultCurrency, true) }}</td>
                    <td class="px-3 py-2 text-sm font-semibold text-brand-600 dark:text-brand-400">{{ formatCurrency(item.commission, defaultCurrency, true) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead>
                  <tr class="bg-gray-50 dark:bg-gray-900/40">
                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Reservation</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Type</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Montant</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Commission Nessia {{ nessiaFeesRate }}%</th>
                    <!-- <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Paye</th> -->
                    <!-- <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Reste</th> -->
                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Ville</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Date debut</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-transparent">
                  <tr v-if="paginatedReservationDetailItems.length === 0">
                    <td colspan="7" class="px-3 py-6 text-center text-sm text-gray-500">Aucune reservation</td>
                  </tr>
                  <tr v-for="reservation in paginatedReservationDetailItems" :key="reservation.id">
                    <td class="px-3 py-3" style="min-width: 280px;">
                      <div class="flex items-center gap-3">
                        <div class="h-12 w-12 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                          <img v-if="reservation.image" :src="reservation.image" :alt="reservation.elementTitre" class="h-full w-full object-contain" />
                          <div v-else class="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">No image</div>
                        </div>
                        <div>
                          <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ reservation.elementTitre }}</p>
                          <p class="text-xs text-gray-500">{{ reservation.reference || reservation.id }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-3 py-3">
                      <span class="rounded-full border px-2 py-0.5 text-xs" :class="reservationTypeBadgeClass(reservation.type)">
                        {{ reservation.type }}
                      </span>
                    </td>
                    <td class="px-3 py-3"><span :class="reservationStatusBadgeClass(reservation.status)">{{ reservation.status }}</span></td>
                    <td class="px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{{ formatCurrency(reservation.montantTotal, reservation.devise, true) }}</td>
                    <td class="px-3 py-3 text-sm font-semibold text-brand-600 dark:text-brand-400">{{ formatCurrency(reservationCommission(reservation), reservation.devise, true) }}</td>
                    <!-- <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">{{ formatCurrency(reservation.paidAmount, reservation.devise, true) }}</td> -->
                    <!-- <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">{{ formatCurrency(reservation.remainingAmount, reservation.devise, true) }}</td> -->
                    <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">{{ reservation.ville || '—' }}</td>
                    <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">{{ formatDate(reservation.dateDebut) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-500">{{ filteredReservationDetailItems.length }} reservation(s)</p>
              <div class="flex items-center gap-2">
                <button
                  class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
                  :disabled="reservationCurrentPage <= 1"
                  @click="reservationCurrentPage -= 1"
                >
                  Precedent
                </button>
                <span class="text-sm text-gray-600 dark:text-gray-300">Page {{ reservationCurrentPage }} / {{ reservationTotalPages }}</span>
                <button
                  class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
                  :disabled="reservationCurrentPage >= reservationTotalPages"
                  @click="reservationCurrentPage += 1"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'paiements'" class="overflow-x-auto">
            <table class="w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-900/40">
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Reference</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Montant</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Statut</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-transparent">
                <tr v-if="paiements.length === 0">
                  <td colspan="4" class="px-3 py-6 text-center text-sm text-gray-500">Aucun paiement</td>
                </tr>
                <tr v-for="paiement in paiements" :key="paiement.id">
                  <td class="px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{{ paiement.reference || paiement.id || '—' }}</td>
                  <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">{{ formatCurrency(paiement.montant, paiement.devise, true) }}</td>
                  <td class="px-3 py-3"><span :class="paymentBadgeClass(paiement.statut)">{{ paiement.statut }}</span></td>
                  <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">{{ formatDate(paiement.dateCreation) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-900/40">
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Auteur</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Note</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Commentaire</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-transparent">
                <tr v-if="reviews.length === 0">
                  <td colspan="4" class="px-3 py-6 text-center text-sm text-gray-500">Aucun avis</td>
                </tr>
                <tr v-for="review in reviews" :key="review.id">
                  <td class="px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">{{ review.userName || '—' }}</td>
                  <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">{{ review.rating }}/5</td>
                  <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300" style="min-width: 260px;">{{ review.comment || '—' }}</td>
                  <td class="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">{{ formatDate(review.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
      </article>
    </div>

    <div v-else class="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
      Prestataire introuvable.
    </div>

    <div v-if="partnerModerationModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
      <div class="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ partnerModerationTargetStatus === 'approved' ? 'Approuver le partenaire' : 'Rejeter le partenaire' }}
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ partnerModerationTargetStatus === 'approved' ? 'Ajouter un motif optionnel.' : 'Le motif est obligatoire pour un rejet.' }}
        </p>

        <textarea
          v-model="partnerModerationReason"
          rows="4"
          placeholder="Saisir le motif..."
          class="mt-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        />

        <div class="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            :disabled="partnerModerationSaving"
            @click="closePartnerModerationModal"
          >
            Annuler
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-semibold text-white"
            :class="partnerModerationTargetStatus === 'approved' ? 'bg-success-500 hover:bg-success-600' : 'bg-error-500 hover:bg-error-600'"
            :disabled="partnerModerationSaving"
            @click="submitPartnerModeration"
          >
            {{ partnerModerationSaving ? 'En cours...' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { auth, authReady, db } from '~/config/firebase'
import { toClientReservationDetailItem, type ClientReservationDetailItem, type Reservation } from '~/models/reservations'
import { getAgence, getAgencePaiements, getAgenceReservations, getAgenceReviews } from '~/services/agences'
import type { Agence, Paiement, Review } from '~/types'

defineOptions({ name: 'PartenairesDetailPage' })

const route = useRoute()

const agence = ref<Agence | null>(null)
const reservations = ref<Reservation[]>([])
const paiements = ref<Paiement[]>([])
const reviews = ref<Review[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref<'reservations' | 'paiements' | 'reviews'>('reservations')
const reservationCategoryFilter = ref('')
const reservationStatusFilter = ref('')
const reservationVilleFilter = ref('')
const reservationMinRevenue = ref<number | null>(null)
const reservationMinCommission = ref<number | null>(null)
const reservationDateFrom = ref('')
const reservationDateTo = ref('')
const reservationPerPage = ref(10)
const reservationCurrentPage = ref(1)
const nessiaFeesRate = ref(0)
const documentReasons = ref<Record<string, string>>({})
const documentSaving = ref<Record<string, boolean>>({})
const documentError = ref<string | null>(null)
const documentSuccess = ref<string | null>(null)
const partnerModerationModalOpen = ref(false)
const partnerModerationTargetStatus = ref<'approved' | 'rejected'>('approved')
const partnerModerationReason = ref('')
const partnerModerationSaving = ref(false)
const partnerActionError = ref<string | null>(null)
const partnerActionSuccess = ref<string | null>(null)

type DocumentReviewStatus = 'approved' | 'rejected' | 'pending'

type AgenceDocumentWithReview = {
  id?: string
  name?: string
  path?: string
  size?: number
  type?: string
  uploadedAt?: Date | { seconds?: number; toDate?: () => Date } | null
  url?: string
  validationStatus?: DocumentReviewStatus
  validationReason?: string
}

const documentsList = computed(() => {
  const source = (agence.value?.documents || {}) as Record<string, AgenceDocumentWithReview>
  const orderedKeys = ['identity', 'company', 'rib']
  const existingKeys = Object.keys(source)
  const keys = [...orderedKeys, ...existingKeys.filter((key) => !orderedKeys.includes(key))]

  return keys
    .map((key) => ({
      key,
      label: key === 'identity' ? 'Identite' : key === 'company' ? 'Societe' : key === 'rib' ? 'RIB' : key,
      ...(source[key] || {}),
    }))
    .filter((item) => item.url || item.path || item.name)
})

const reservationDetailItems = computed<ClientReservationDetailItem[]>(() => {
  return reservations.value.map((reservation) => toClientReservationDetailItem(reservation, paiements.value))
})

const reservationCategoryOptions = computed(() => {
  const types = [...new Set(reservationDetailItems.value.map((reservation) => reservation.type))]
  return [
    { value: '', text: 'Toutes les categories' },
    ...types.map((type) => ({ value: type, text: type })),
  ]
})

const reservationStatusOptions = computed(() => {
  const statuses = [...new Set(reservationDetailItems.value.map((reservation) => String(reservation.status || '').trim()).filter(Boolean))]
  return statuses.sort((a, b) => a.localeCompare(b))
})

const filteredReservationDetailItems = computed<ClientReservationDetailItem[]>(() => {
  return reservationDetailItems.value.filter((reservation) => {
    if (reservationCategoryFilter.value && reservation.type !== reservationCategoryFilter.value) return false

    if (reservationStatusFilter.value) {
      const currentStatus = String(reservation.status || '').trim().toLowerCase()
      if (currentStatus !== reservationStatusFilter.value.toLowerCase()) return false
    }

    if (reservationVilleFilter.value) {
      const currentVille = String(reservation.ville || '').toLowerCase()
      if (!currentVille.includes(reservationVilleFilter.value.toLowerCase())) return false
    }

    if (reservationMinRevenue.value !== null && reservationMinRevenue.value !== undefined && reservationMinRevenue.value !== 0) {
      const revenue = Number(reservation.montantTotal || 0)
      if (revenue < reservationMinRevenue.value) return false
    }

    if (reservationMinCommission.value !== null && reservationMinCommission.value !== undefined && reservationMinCommission.value !== 0) {
      if (reservationCommission(reservation) < reservationMinCommission.value) return false
    }

    const reservationDate = toDate(reservation.dateDebut)
    if (reservationDateFrom.value) {
      const fromDate = new Date(`${reservationDateFrom.value}T00:00:00`)
      if (!reservationDate || reservationDate < fromDate) return false
    }

    if (reservationDateTo.value) {
      const toDateValue = new Date(`${reservationDateTo.value}T23:59:59`)
      if (!reservationDate || reservationDate > toDateValue) return false
    }

    return true
  })
})

const reservationTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredReservationDetailItems.value.length / reservationPerPage.value))
})

const paginatedReservationDetailItems = computed<ClientReservationDetailItem[]>(() => {
  const start = (reservationCurrentPage.value - 1) * reservationPerPage.value
  return filteredReservationDetailItems.value.slice(start, start + reservationPerPage.value)
})

watch(
  [
    reservationCategoryFilter,
    reservationStatusFilter,
    reservationVilleFilter,
    reservationMinRevenue,
    reservationMinCommission,
    reservationDateFrom,
    reservationDateTo,
    reservationPerPage,
  ],
  () => {
    reservationCurrentPage.value = 1
  },
)

watch(filteredReservationDetailItems, () => {
  if (reservationCurrentPage.value > reservationTotalPages.value) {
    reservationCurrentPage.value = reservationTotalPages.value
  }
})

onMounted(async () => {
  try {
    const agenceId = String(route.params.id || '')
    if (!agenceId) return

    const nessiaConfigSnap = await getDoc(doc(db, 'nessiaConfig', 'config'))
    nessiaFeesRate.value = Number(nessiaConfigSnap.data()?.nessiaFees ?? 0)

    const foundAgence = await getAgence(agenceId)
    agence.value = foundAgence
    if (!foundAgence) return

    const [agenceReservations, agencePaiements, agenceReviews] = await Promise.all([
      getAgenceReservations(foundAgence),
      getAgencePaiements(foundAgence),
      getAgenceReviews(agenceId),
    ])

    reservations.value = agenceReservations
    paiements.value = agencePaiements
    reviews.value = agenceReviews
  } catch {
    error.value = 'Impossible de charger le detail du prestataire.'
  } finally {
    loading.value = false
  }
})

const documentStatusLabel = (status?: string) => {
  const value = String(status || 'pending').toLowerCase()
  if (value === 'approved') return 'Valide'
  if (value === 'rejected') return 'Rejete'
  return 'En attente'
}

const documentStatusClass = (status?: string) => {
  const value = String(status || 'pending').toLowerCase()
  if (value === 'approved') return 'inline-flex rounded-full bg-success-50 px-2 py-0.5 text-xs text-success-600'
  if (value === 'rejected') return 'inline-flex rounded-full bg-error-50 px-2 py-0.5 text-xs text-error-600'
  return 'inline-flex rounded-full bg-warning-50 px-2 py-0.5 text-xs text-warning-600'
}

const applicationStatusLabel = (status?: string) => {
  const value = String(status || '').toLowerCase()
  if (value === 'approved') return 'Approuve'
  if (value === 'rejected') return 'Rejete'
  if (value === 'suspended') return 'Suspendu'
  return 'En attente'
}

const applicationStatusClass = (status?: string) => {
  const value = String(status || '').toLowerCase()
  if (value === 'approved') return 'bg-success-50 text-success-700'
  if (value === 'rejected' || value === 'suspended') return 'bg-error-50 text-error-700'
  return 'bg-warning-50 text-warning-700'
}

const isPartnerVerified = computed(() => {
  return String(agence.value?.applicationStatus || '').toLowerCase() === 'approved'
})

const openPartnerModerationModal = (status: 'approved' | 'rejected') => {
  partnerModerationTargetStatus.value = status
  partnerModerationReason.value = ''
  partnerActionError.value = null
  partnerActionSuccess.value = null
  partnerModerationModalOpen.value = true
}

const closePartnerModerationModal = () => {
  if (partnerModerationSaving.value) return
  partnerModerationModalOpen.value = false
}

const getLoggedAdminUid = async () => {
  const user = auth.currentUser || await authReady
  return user?.uid || ''
}

const submitPartnerModeration = async () => {
  if (!agence.value?.id) return
  const reason = partnerModerationReason.value.trim()
  const status = partnerModerationTargetStatus.value

  if (status === 'rejected' && !reason) {
    partnerActionError.value = 'Le motif est obligatoire pour rejeter le partenaire.'
    return
  }

  partnerModerationSaving.value = true
  partnerActionError.value = null
  partnerActionSuccess.value = null

  const reviewedBy = await getLoggedAdminUid()
  const reviewedAt = new Date()

  const moderationEntry = {
    createdAt: new Date(),
    reason,
    status,
    reviewedBy,
    reviewedAt,
  }

//   const moderationNotification = {
//     category: 'partner',
//     status,
//     reason,
//     message: status === 'approved' ? 'Votre compte partenaire a ete approuve.' : 'Votre compte partenaire a ete rejete.',
//     createdAt: new Date(),
//     read: false,
//   }

  try {
    await updateDoc(doc(db, 'agences', agence.value.id), {
      applicationStatus: status,
    //   'moderation.partnerDecisions': arrayUnion(moderationEntry),
    //   'moderation.notifications': arrayUnion(moderationNotification),
      moderation: moderationEntry,
    })

    agence.value = {
      ...agence.value,
      applicationStatus: status,
    }

    partnerActionSuccess.value = status === 'approved' ? 'Partenaire approuve avec succes.' : 'Partenaire rejete avec succes.'
    partnerModerationModalOpen.value = false
  } catch {
    partnerActionError.value = 'Impossible de mettre a jour le statut du partenaire.'
  } finally {
    partnerModerationSaving.value = false
  }
}

const isDocumentSaving = (key: string) => Boolean(documentSaving.value[key])

const applyDocumentDecision = async (docKey: string, status: 'approved' | 'rejected') => {
  if (!agence.value?.id) return

  const reason = String(documentReasons.value[docKey] || '').trim()
  if (status === 'rejected' && !reason) {
    documentError.value = 'Veuillez saisir un motif pour rejeter le document.'
    documentSuccess.value = null
    return
  }

  documentSaving.value[docKey] = true
  documentError.value = null
  documentSuccess.value = null

  try {
    const moderationEntry = {
      actionType: 'document_review',
      documentKey: docKey,
      status,
      reason,
      createdAt: new Date(),
    }

    const moderationNotification = {
      category: 'document',
      documentKey: docKey,
      status,
      reason,
      message: status === 'approved' ? `Document ${docKey} valide.` : `Document ${docKey} rejete.`,
      createdAt: new Date(),
      read: false,
    }

    await updateDoc(doc(db, 'agences', agence.value.id), {
      [`documents.${docKey}.validationStatus`]: status,
      [`documents.${docKey}.validationReason`]: status === 'rejected' ? reason : '',
      [`documents.${docKey}.validatedAt`]: new Date(),
      'moderation.documentDecisions': arrayUnion(moderationEntry),
      'moderation.notifications': arrayUnion(moderationNotification),
    })

    const current = ((agence.value.documents || {}) as Record<string, AgenceDocumentWithReview>)[docKey] || {}
    const updatedDocuments = {
      ...(agence.value.documents || {}),
      [docKey]: {
        ...current,
        validationStatus: status,
        validationReason: status === 'rejected' ? reason : '',
      },
    }

    agence.value = {
      ...agence.value,
      documents: updatedDocuments as Agence['documents'],
    }

    documentSuccess.value = status === 'approved' ? 'Document valide avec succes.' : 'Document rejete avec succes.'
  } catch {
    documentError.value = 'Impossible de mettre a jour le statut du document.'
  } finally {
    documentSaving.value[docKey] = false
  }
}

const agencyName = (item: Agence) => item.nom || item.name || `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() || '—'
const initials = (item: Agence) => agencyName(item).split(' ').slice(0, 2).map((part) => part[0] || '').join('').toUpperCase() || '?'

const providerAddress = (item: Agence) => {
  const source = item as Agence & { adresse?: string; address?: string; quartier?: string }
  return source.adresse || source.address || [source.quartier, source.city || source.ville].filter(Boolean).join(', ') || source.city || source.ville || '—'
}

const categoriesInscrites = (item: Agence) => {
  const services = (item.selectedServices || []).filter(Boolean)
  if (services.length) return services.join(', ')
  return item.serviceZones || '—'
}

const toDate = (value?: Date | { seconds?: number; toDate?: () => Date } | null) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') return value.toDate()
  if (typeof value === 'object' && 'seconds' in value && typeof value.seconds === 'number') return new Date(value.seconds * 1000)
  return null
}

const formatDate = (value?: Date | { seconds?: number; toDate?: () => Date } | null) => {
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

const formatCurrency = (amount?: number, currency = 'MAD', allowZero = false) => {
  if ((!amount && amount !== 0) || (amount === 0 && !allowZero)) return '—'
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Number(amount || 0))
  return currency === 'MAD' ? formatted.replace('MAD', 'Dhs') : formatted
}

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

const reservationCommission = (reservation: ClientReservationDetailItem) => {
  const amount = Number(reservation.montantTotal ?? 0)
  return round2(amount * (nessiaFeesRate.value / 100))
}

const defaultCurrency = computed(() => {
  return agence.value?.currency || filteredReservationDetailItems.value[0]?.devise || 'MAD'
})

const categorySummary = computed(() => {
  const grouped = new Map<string, { count: number; revenue: number; commission: number }>()

  for (const reservation of filteredReservationDetailItems.value) {
    const category = reservation.type || 'Autre'
    const current = grouped.get(category) || { count: 0, revenue: 0, commission: 0 }
    const revenue = Number(reservation.montantTotal || 0)
    const commission = reservationCommission(reservation)

    grouped.set(category, {
      count: current.count + 1,
      revenue: round2(current.revenue + revenue),
      commission: round2(current.commission + commission),
    })
  }

  return Array.from(grouped.entries())
    .map(([category, stats]) => ({ category, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
})

const ratingValue = (item: Agence) => {
  const stats = item.stats
  if (!stats) return 0
  const totalReviews = stats.totalReviews ?? 0
  if (totalReviews > 0) return Number(((stats.ratingSum ?? 0) / totalReviews).toFixed(1))
  return stats.rating ?? item.rating ?? 0
}

const ratingLabel = (item: Agence) => {
  const value = ratingValue(item)
  return value > 0 ? `${value}/5` : '—'
}

const paymentBadgeClass = (status?: string) => {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'confirmed' || normalized === 'paid') return 'inline-flex rounded-full bg-success-50 px-2 py-0.5 text-xs text-success-600'
  if (normalized === 'pending') return 'inline-flex rounded-full bg-warning-50 px-2 py-0.5 text-xs text-warning-600'
  if (normalized === 'failed' || normalized === 'cancelled' || normalized === 'refunded') return 'inline-flex rounded-full bg-error-50 px-2 py-0.5 text-xs text-error-600'
  return 'inline-flex rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700'
}

const reservationStatusBadgeClass = (status?: string) => {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'confirmee' || normalized === 'confirmed') return 'inline-flex rounded-full bg-success-50 px-2 py-0.5 text-xs text-success-600'
  if (normalized === 'pending') return 'inline-flex rounded-full bg-warning-50 px-2 py-0.5 text-xs text-warning-600'
  if (normalized === 'annulee' || normalized === 'refunded' || normalized === 'cancelled') return 'inline-flex rounded-full bg-error-50 px-2 py-0.5 text-xs text-error-600'
  return 'inline-flex rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700'
}

const reservationTypeBadgeClass = (type?: string) => {
  const value = String(type || '').toLowerCase()
  if (value.includes('hebergement')) return 'border-info-100 bg-info-50 text-info-600'
  if (value.includes('activit') || value.includes('activity')) return 'border-warning-100 bg-warning-50 text-warning-600'
  if (value.includes('location')) return 'border-success-100 bg-success-50 text-success-600'
  if (value.includes('vtc')) return 'border-purple-100 bg-purple-50 text-purple-600'
  return 'border-gray-200 bg-gray-50 text-gray-700'
}

const totalRevenue = computed(() => {
  if (!agence.value) return '—'
  const total = paiements.value.filter((p) => p.statut === 'confirmed').reduce((sum, p) => sum + Number(p.montant ?? 0), 0)
  return formatCurrency(total, agence.value.currency || 'MAD', true)
})

const confirmedPaymentsProgress = computed(() => {
  if (paiements.value.length === 0) return 0
  const confirmedCount = paiements.value.filter((payment) => payment.statut === 'confirmed').length
  return Math.round((confirmedCount / paiements.value.length) * 100)
})

const confirmedReservationsCount = computed(() => {
  return reservations.value.filter((reservation) => reservation.status === 'confirmee').length
})

const reservationCategoryCount = computed(() => {
  return new Set(reservations.value.map((reservation) => reservation.type).filter(Boolean)).size
})
</script>
