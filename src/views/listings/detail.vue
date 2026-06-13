<template>
  <admin-layout>
    <page-breadcrumb page-title="Détails de l'annonce" />

    <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">Chargement...</div>
    <div v-else-if="error" class="rounded-2xl border border-error-200 bg-error-50 p-6 text-center text-sm text-error-700">{{ error }}</div>

    <div v-else-if="listing" class="space-y-4">
      <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="flex flex-wrap items-start gap-4">
          <div v-if="listing.image" class="h-28 w-28 overflow-hidden rounded-lg bg-gray-100">
            <img :src="listing.image" :alt="listing.title" class="h-full w-full object-contain" />
          </div>

          <div class="flex-1">
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                @click="handleBack"
              >
                Retour aux listings
              </button>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ listing.title }}</h3>
              <span class="rounded-full border px-2 py-0.5 text-xs" :class="categoryBadgeClass(listing.category)">{{ categoryLabel(listing.category) }}</span>
              <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="moderationBadgeClass(listing.moderation.status || '')">
                {{ moderationLabel(listing.moderation.status || '') }}
              </span>
              <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusBadgeClass(listing.status)">{{ statusLabel(listing.status) }}</span>
              <span v-if="listing.sponsored" class="rounded-full bg-warning-50 px-2 py-0.5 text-xs font-medium text-warning-600">Sponsorisee</span>
              <span v-if="listing.signaled" class="rounded-full bg-error-50 px-2 py-0.5 text-xs font-medium text-error-600">Signalee</span>
            </div>

            <p class="text-xs text-gray-500">ID: {{ listing.id }}</p>

            <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <p class="text-xs text-gray-500">Partenaire</p>
                <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ resolvedProviderName }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Ville</p>
                <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ h.localisation?.ville || listing.city || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Adresse</p>
                <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ h.localisation?.adresse || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Quartier</p>
                <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ h.localisation?.quartier || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Creee le</p>
                <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatDate(listing.createdAt) }}</p>
              </div>
            </div>
          </div>

          <div class="flex shrink-0 flex-col gap-2">
            <button class="rounded-lg bg-success-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-50" :disabled="updating || listing.moderation.status === 'approved'" @click="handleApprove">Approuver</button>
            <button class="rounded-lg bg-error-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-50" :disabled="updating" @click="showReject = true">Rejeter</button>
          </div>
        </div>
      </div>

      <div v-if="galleryImages.length" class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Photos</h4>
          <span class="text-xs text-gray-500">{{ galleryImages.length }} image(s)</span>
        </div>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          <a
            v-for="(img, idx) in galleryImages"
            :key="`${img}-${idx}`"
            :href="img"
            target="_blank"
            rel="noopener noreferrer"
            class="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800"
            style="aspect-ratio: 1 / 1;"
          >
            <img :src="img" :alt="`Photo ${idx + 1}`" class="h-full w-full object-contain transition group-hover:scale-105" />
            <span v-if="mainImageUrl && img === mainImageUrl" class="absolute left-1 top-1 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">Main</span>
          </a>
        </div>
      </div>

      <template v-if="listing.category === 'HEBERGEMENT'">
        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-2">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Informations generales</h4>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div><p class="text-xs text-gray-500">Type</p><p class="text-sm font-semibold text-gray-800 dark:text-white">{{ h.typeHebergement || h.type || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Reference</p><p class="text-sm font-semibold text-gray-800 dark:text-white">{{ h.reference || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Disponible</p><p class="text-sm font-semibold text-gray-800 dark:text-white">{{ h.isAvailable ? 'Oui' : 'Non' }}</p></div>
              <div><p class="text-xs text-gray-500">Maj</p><p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatDate(h.updatedAt as Parameters<typeof formatDate>[0]) }}</p></div>
              <div class="sm:col-span-2 xl:col-span-4">
                <p class="text-xs text-gray-500">
                Description
              </p>
              <p v-if="formattedHDescription" class="text-sm text-gray-700 dark:text-gray-300" v-html="formattedHDescription" />
              <p v-else class="text-sm text-gray-700 dark:text-gray-300">—</p>
              </div>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Caracteristiques</h4>
            <div class="grid grid-cols-2 gap-3">
              <div><p class="text-xs text-gray-500">Capacite max</p><p class="text-sm font-semibold">{{ h.caracteristiques?.capaciteMax ?? '—' }} pers.</p></div>
              <div><p class="text-xs text-gray-500">Chambres</p><p class="text-sm font-semibold">{{ h.caracteristiques?.nbChambres ?? '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Lits doubles</p><p class="text-sm font-semibold">{{ h.caracteristiques?.litsDouble ?? '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Lits simples</p><p class="text-sm font-semibold">{{ h.caracteristiques?.litsSimple ?? '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Salles de bain</p><p class="text-sm font-semibold">{{ h.caracteristiques?.nbSallesDeBain ?? '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Superficie</p><p class="text-sm font-semibold">{{ h.caracteristiques?.superficie != null ? `${h.caracteristiques.superficie} m²` : '—' }}</p></div>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Tarifs</h4>
            <div class="grid grid-cols-2 gap-3">
              <div><p class="text-xs text-gray-500">Prix nuit</p><p class="text-sm font-semibold">{{ formatCurrency(h.tarifs?.prixNuit, listing.currency) }}</p></div>
              <div><p class="text-xs text-gray-500">Prix base</p><p class="text-sm font-semibold">{{ formatCurrency(h.tarifs?.prixBase, listing.currency) }}</p></div>
              <div><p class="text-xs text-gray-500">Caution</p><p class="text-sm font-semibold">{{ formatCurrency(h.tarifs?.caution, listing.currency) }}</p></div>
              <div><p class="text-xs text-gray-500">Frais menage</p><p class="text-sm font-semibold">{{ formatCurrency(h.tarifs?.fraisMenage, listing.currency) }}</p></div>
              <div><p class="text-xs text-gray-500">Nuits min</p><p class="text-sm font-semibold">{{ h.tarifs?.nbNuitsMin ?? '—' }}</p></div>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Localisation</h4>
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2"><p class="text-xs text-gray-500">Adresse</p><p class="text-sm font-semibold">{{ h.localisation?.adresse || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Quartier</p><p class="text-sm font-semibold">{{ h.localisation?.quartier || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Ville</p><p class="text-sm font-semibold">{{ h.localisation?.ville || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Code postal</p><p class="text-sm font-semibold">{{ h.localisation?.codePostal || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Etage</p><p class="text-sm font-semibold">{{ h.localisation?.etage ?? '—' }}</p></div>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Services</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="[k, v] in hServicesEntries" :key="k" class="rounded-full border px-2 py-1 text-xs" :class="v ? 'border-success-200 bg-success-50 text-success-700' : 'border-gray-200 bg-gray-50 text-gray-600'">{{ servicesLabels[k] || k }}</span>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Equipements</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="[k, v] in hEquipementsEntries" :key="k" class="rounded-full border px-2 py-1 text-xs" :class="v ? 'border-success-200 bg-success-50 text-success-700' : 'border-gray-200 bg-gray-50 text-gray-600'">{{ equipementsLabels[k] || k }}</span>
            </div>
          </section>
        </div>
      </template>

      <template v-else-if="listing.category === 'ACTIVITE'">
        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-2">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Informations activite</h4>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div><p class="text-xs text-gray-500">Titre</p><p class="text-sm font-semibold">{{ a.titre || listing.title || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Type</p><p class="text-sm font-semibold">{{ a.type || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Duree</p><p class="text-sm font-semibold">{{ a.duree || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Type duree</p><p class="text-sm font-semibold">{{ a.dureeType || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Prix / pers.</p><p class="text-sm font-semibold">{{ formatCurrency(a.prixParPersonne, a.devise || listing.currency) }}</p></div>
              <div><p class="text-xs text-gray-500">Acompte</p><p class="text-sm font-semibold">{{ a.acomptePourcentage != null ? `${a.acomptePourcentage}%` : '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Places</p><p class="text-sm font-semibold">{{ a.placesDisponibles ?? '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Delai annulation</p><p class="text-sm font-semibold">{{ a.delaiAnnulation != null ? `${a.delaiAnnulation} h` : '—' }}</p></div>
              <div class="sm:col-span-2 xl:col-span-4"><p class="text-xs text-gray-500">Description</p><p class="text-sm">{{ a.description || '—' }}</p></div>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Categories</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="cat in aCategories" :key="cat" class="rounded-full border border-warning-200 bg-warning-50 px-2 py-1 text-xs text-warning-700">{{ cat }}</span>
              <span v-if="!aCategories.length" class="text-sm text-gray-500">—</span>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Equipements</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="eq in aEquipements" :key="eq" class="rounded-full border border-success-200 bg-success-50 px-2 py-1 text-xs text-success-700">{{ eq }}</span>
              <span v-if="!aEquipements.length" class="text-sm text-gray-500">—</span>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Disponibilites</h4>
            <p class="mb-1 text-xs text-gray-500">Jours</p>
            <div class="mb-3 flex flex-wrap gap-2">
              <span v-for="day in aJoursDisponibles" :key="day" class="rounded-full border border-info-200 bg-info-50 px-2 py-1 text-xs text-info-700">{{ day }}</span>
              <span v-if="!aJoursDisponibles.length" class="text-sm text-gray-500">—</span>
            </div>
            <p class="mb-1 text-xs text-gray-500">Horaires</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="slot in aHorairesDisponibles" :key="slot" class="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">{{ slot }}</span>
              <span v-if="!aHorairesDisponibles.length" class="text-sm text-gray-500">—</span>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Statistiques</h4>
            <div class="grid grid-cols-2 gap-3">
              <div><p class="text-xs text-gray-500">Avis</p><p class="text-sm font-semibold">{{ a.nombreAvis ?? 0 }}</p></div>
              <div><p class="text-xs text-gray-500">Note</p><p class="text-sm font-semibold">{{ a.noteMoyenne ?? 0 }}</p></div>
              <div><p class="text-xs text-gray-500">Popularite</p><p class="text-sm font-semibold">{{ a.popularite ?? 0 }}</p></div>
              <div><p class="text-xs text-gray-500">Ville</p><p class="text-sm font-semibold">{{ a.ville || listing.city || '—' }}</p></div>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-2">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Programme</h4>
            <div v-if="aProgramme.length" class="overflow-x-auto">
              <table class="w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead>
                  <tr class="bg-gray-50 dark:bg-gray-900/40">
                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Jour</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Titre</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Description</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="(step, idx) in aProgramme" :key="`${idx}-${step.titre || ''}`">
                    <td class="px-3 py-2 text-sm">{{ step.jour ?? '—' }}</td>
                    <td class="px-3 py-2 text-sm">{{ step.titre || '—' }}</td>
                    <td class="px-3 py-2 text-sm">{{ step.description || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-sm text-gray-500">Aucun programme defini.</p>
          </section>
        </div>
      </template>

      <template v-else-if="listing.category === 'LOCATION_VOITURE'">
        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-2">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Informations vehicule</h4>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div><p class="text-xs text-gray-500">Nom annonce</p><p class="text-sm font-semibold">{{ loc.nom || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Marque</p><p class="text-sm font-semibold">{{ loc.marque || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Modele</p><p class="text-sm font-semibold">{{ loc.modele || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Annee</p><p class="text-sm font-semibold">{{ loc.annee ?? '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Carburant</p><p class="text-sm font-semibold">{{ loc.carburant || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Transmission</p><p class="text-sm font-semibold">{{ loc.transmission || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Categorie</p><p class="text-sm font-semibold">{{ loc.categorie || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Ville</p><p class="text-sm font-semibold">{{ loc.ville || '—' }}</p></div>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Tarifs</h4>
            <div class="grid grid-cols-2 gap-3">
              <div><p class="text-xs text-gray-500">Prix / jour</p><p class="text-sm font-semibold">{{ formatCurrency(loc.prixJour, loc.devise || listing.currency) }}</p></div>
              <div><p class="text-xs text-gray-500">Prix / semaine</p><p class="text-sm font-semibold">{{ formatCurrency(loc.prixSemaine, loc.devise || listing.currency) }}</p></div>
              <div><p class="text-xs text-gray-500">Prix / mois</p><p class="text-sm font-semibold">{{ formatCurrency(loc.prixMois, loc.devise || listing.currency) }}</p></div>
              <div><p class="text-xs text-gray-500">Caution</p><p class="text-sm font-semibold">{{ formatCurrency(loc.caution, loc.devise || listing.currency) }}</p></div>
              <div><p class="text-xs text-gray-500">Kilometrage inclus</p><p class="text-sm font-semibold">{{ loc.kilometrageInclus != null ? `${loc.kilometrageInclus} km` : '—' }}</p></div>
              <div><p class="text-xs text-gray-500">Supplement / km</p><p class="text-sm font-semibold">{{ loc.supplementKm != null ? `${loc.supplementKm} ${(loc.devise || listing.currency)}/km` : '—' }}</p></div>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Equipements</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="eq in locEquipements" :key="eq" class="rounded-full border border-success-200 bg-success-50 px-2 py-1 text-xs text-success-700">{{ eq }}</span>
              <span v-if="!locEquipements.length" class="text-sm text-gray-500">Aucun equipement renseigne.</span>
            </div>
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-2">
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Agence proprietaire</h4>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div><p class="text-xs text-gray-500">Nom agence</p><p class="text-sm font-semibold">{{ loc.agenceNom || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">ID agence</p><p class="text-sm font-semibold">{{ loc.agenceId || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">ID annonce</p><p class="text-sm font-semibold">{{ loc.annonceId || '—' }}</p></div>
              <div><p class="text-xs text-gray-500">ID vehicule</p><p class="text-sm font-semibold">{{ loc.vehiculeId || '—' }}</p></div>
            </div>
          </section>
        </div>
      </template>

      <div v-else class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Donnees de l'annonce</h4>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <template v-for="[key, value] in rawEntries" :key="key">
            <div v-if="!shouldHideRawField(key, value)" class="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
              <p class="text-xs text-gray-500">{{ key }}</p>
              <p class="mt-1 break-all text-sm font-semibold text-gray-800 dark:text-white">{{ formatValue(value) }}</p>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="showReject" class="fixed inset-0 z-[120000] flex items-center justify-center bg-black/40 p-4" @click.self="showReject = false">
      <div class="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Motif de rejet</h3>
        <textarea v-model="rejectReason" rows="5" class="mt-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200" placeholder="Ajouter le motif du rejet..." />
        <div class="mt-4 flex justify-end gap-2">
          <button class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700" @click="showReject = false">Annuler</button>
          <button class="rounded-lg bg-error-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50" :disabled="updating || !rejectReason.trim()" @click="handleReject">Valider le rejet</button>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import type { PartnerListingCategory, PartnerListingListItem } from '~/models/listings'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { db } from '~/config/firebase'
import { approvePartnerListing, getListingById, rejectPartnerListing } from '~/services/listings'

defineOptions({ name: 'ListingDetailPage' })

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const updating = ref(false)
const error = ref<string | null>(null)
const listing = ref<PartnerListingListItem | null>(null)
const showReject = ref(false)
const rejectReason = ref('')
const providerNameFromAgence = ref('')
const hebergementGallery = ref<Array<{
  id: string
  url: string
  isMain: boolean
  ordre: number | null
  type: string
  uploadedAtMillis: number
  status: string
}>>([])

const category = computed(() => String(route.params.category || '') as PartnerListingCategory)
const id = computed(() => String(route.params.id || ''))

onMounted(async () => {
  try {
    const result = await getListingById(category.value, id.value)
    if (!result) {
      error.value = 'Annonce introuvable.'
      return
    }
    listing.value = result
    rejectReason.value = result.rejectedReason || ''
    await fetchProviderNameFromAgenceRef(result)

    if (result.category === 'HEBERGEMENT') {
      await fetchHebergementGallery(result.id)
    }
  } catch {
    error.value = 'Impossible de charger le detail de cette annonce.'
  } finally {
    loading.value = false
  }
})

const agenceDisplayName = (agence: Record<string, unknown>): string => {
  const fullName = `${String(agence.firstName ?? '')} ${String(agence.lastName ?? '')}`.trim()
  return String(agence.nom || agence.name || fullName || '—')
}

const extractAgenceRef = (value: unknown): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const maybeRef = value as { id?: unknown; path?: unknown }
    if (typeof maybeRef.id === 'string') return maybeRef.id
    if (typeof maybeRef.path === 'string') {
      const chunks = maybeRef.path.split('/').filter(Boolean)
      return chunks[chunks.length - 1] || ''
    }
  }
  return ''
}

const fetchProviderNameFromAgenceRef = async (item: PartnerListingListItem) => {
  try {
    const rawData = item.raw as Record<string, unknown>
    const agenceRef = extractAgenceRef(rawData.agenceRef) || item.providerId
    if (!agenceRef) {
      providerNameFromAgence.value = ''
      return
    }

    const agenceSnap = await getDoc(doc(db, 'agences', agenceRef))
    if (!agenceSnap.exists()) {
      providerNameFromAgence.value = ''
      return
    }

    providerNameFromAgence.value = agenceDisplayName(agenceSnap.data() as Record<string, unknown>)
  } catch {
    providerNameFromAgence.value = ''
  }
}

const resolvedProviderName = computed(() => providerNameFromAgence.value || listing.value?.providerName || '—')

const fetchHebergementGallery = async (hebergementId: string) => {
  try {
    const snap = await getDocs(collection(db, 'hebergements', hebergementId, 'galerie'))
    const parsed = snap.docs
      .map((d) => {
        const data = d.data() as Record<string, unknown>
        const url = typeof data.url === 'string' ? data.url.trim() : ''
        if (!url) return null

        return {
          id: d.id,
          url,
          isMain: Boolean(data.isMain),
          ordre: typeof data.ordre === 'number' ? data.ordre : null,
          type: typeof data.type === 'string' ? data.type : 'image',
          uploadedAtMillis:
            data.uploadedAt && typeof data.uploadedAt === 'object' && 'seconds' in data.uploadedAt
              ? Number((data.uploadedAt as { seconds?: number }).seconds || 0) * 1000
              : 0,
          status:
            typeof data.validationStatus === 'string'
              ? data.validationStatus
              : (typeof data.status === 'string' ? data.status : 'approved'),
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .filter((item) => item.type !== 'video')
      .filter((item) => item.status !== 'rejected')
      .sort((a, b) => {
        if (a.isMain !== b.isMain) return a.isMain ? -1 : 1
        if (a.ordre !== null && b.ordre !== null && a.ordre !== b.ordre) return a.ordre - b.ordre
        if (a.ordre !== null) return -1
        if (b.ordre !== null) return 1
        return a.uploadedAtMillis - b.uploadedAtMillis
      })

    hebergementGallery.value = parsed
  } catch {
    hebergementGallery.value = []
  }
}

const raw = computed(() => listing.value?.raw || {})

const imageKeyPattern = /(image|img|photo|photos|gallery|cover|thumbnail|avatar|logo)/i

const looksLikeImageUrl = (value: string): boolean => {
  const url = value.toLowerCase()
  if (!url.startsWith('http')) return false
  return /(\.png|\.jpe?g|\.webp|\.gif|\.avif)(\?|$)/.test(url)
    || url.includes('firebasestorage.googleapis.com')
    || url.includes('alt=media')
}

const collectImageUrls = (value: unknown, key = ''): string[] => {
  if (typeof value === 'string') {
    if (looksLikeImageUrl(value) || (imageKeyPattern.test(key) && value.startsWith('http'))) return [value]
    return []
  }
  if (Array.isArray(value)) return value.flatMap((item) => collectImageUrls(item, key))
  if (value && typeof value === 'object') return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) => collectImageUrls(v, k))
  return []
}

const mainImageUrl = computed(() => {
  const mainFromGalerie = hebergementGallery.value.find((item) => item.isMain)?.url
  if (mainFromGalerie) return mainFromGalerie

  const rawData = raw.value as Record<string, unknown>
  const candidates = [rawData.mainImage, rawData.imageUrl, listing.value?.image]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && looksLikeImageUrl(candidate)) return candidate
  }
  return ''
})

const galleryImages = computed(() => {
  const images = new Set<string>()
  hebergementGallery.value.forEach((item) => images.add(item.url))
  if (listing.value?.image) images.add(listing.value.image)
  collectImageUrls(raw.value).forEach((url) => images.add(url))
  const ordered = [...images]
  if (mainImageUrl.value) {
    const withoutMain = ordered.filter((url) => url !== mainImageUrl.value)
    return [mainImageUrl.value, ...withoutMain]
  }
  return ordered
})

const formatDate = (value?: { seconds?: number } | Date | null) => {
  if (!value) return '—'
  const date = value instanceof Date ? value : value.seconds ? new Date(value.seconds * 1000) : null
  if (!date) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const formatCurrency = (amount?: number | null, currency = 'MAD') => {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const isTimestamp = (val: unknown): val is { seconds: number } =>
  typeof val === 'object' && val !== null && !Array.isArray(val) && 'seconds' in (val as object)

const isBoolFlagsObject = (val: unknown): boolean => {
  if (typeof val !== 'object' || val === null || Array.isArray(val) || isTimestamp(val)) return false
  const entries = Object.values(val as Record<string, unknown>)
  return entries.length > 0 && entries.every((v) => typeof v === 'boolean')
}

const formatValue = (val: unknown): string => {
  if (val === null || val === undefined || val === '') return '—'
  if (typeof val === 'boolean') return val ? 'Oui' : 'Non'
  if (isTimestamp(val)) return formatDate(val)
  if (Array.isArray(val)) return val.map((item) => String(item)).join(', ') || '—'
  if (isBoolFlagsObject(val)) {
    const trueKeys = Object.entries(val as Record<string, boolean>).filter(([, v]) => v).map(([k]) => k)
    return trueKeys.length ? trueKeys.join(', ') : '—'
  }
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

const isImageFieldKey = (key: string): boolean => imageKeyPattern.test(key)
const isImageStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && looksLikeImageUrl(item))
const shouldHideRawField = (key: string, value: unknown): boolean => {
  if (!isImageFieldKey(key)) return false
  if (typeof value === 'string' && looksLikeImageUrl(value)) return true
  if (isImageStringArray(value)) return true
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) && isImageFieldKey(key))
}

const rawEntries = computed(() => Object.entries(raw.value))

type HRaw = {
  typeHebergement?: string
  type?: string
  reference?: string
  isAvailable?: boolean
  description?: string
  updatedAt?: unknown
  caracteristiques?: { capaciteMax?: number; nbChambres?: number; litsDouble?: number; litsSimple?: number; nbSallesDeBain?: number; superficie?: number }
  tarifs?: { prixNuit?: number; prixBase?: number; caution?: number; fraisMenage?: number; nbNuitsMin?: number }
  localisation?: { adresse?: string; quartier?: string; ville?: string; codePostal?: string; etage?: number }
  services?: Record<string, unknown> & { typePetitDejeuner?: string }
  equipements?: Record<string, boolean>
}
const h = computed(() => raw.value as HRaw)
const hServicesEntries = computed(() => Object.entries(h.value.services ?? {}).filter(([k]) => k !== 'typePetitDejeuner') as [string, boolean][]) 
const hEquipementsEntries = computed(() => Object.entries(h.value.equipements ?? {}) as [string, boolean][])
const formattedHDescription = computed(() => {
  const value = h.value.description
  if (!value || !value.trim()) return ''

  // Normalize editor leftovers and keep simple rich-text formatting from stored HTML.
  return value
    .replace(/<d\s*$/i, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/ on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .trim()
})

type ARaw = {
  titre?: string
  type?: string
  duree?: string
  dureeType?: string
  prixParPersonne?: number
  devise?: string
  acomptePourcentage?: number
  placesDisponibles?: number
  delaiAnnulation?: number
  description?: string
  categorie?: string[]
  equipements?: string[]
  joursDisponibles?: string[]
  horairesDisponibles?: string[]
  nombreAvis?: number
  noteMoyenne?: number
  popularite?: number
  ville?: string
  programme?: Array<{ jour?: number; titre?: string; description?: string }>
}
const a = computed(() => raw.value as ARaw)
const aCategories = computed(() => Array.isArray(a.value.categorie) ? a.value.categorie : [])
const aEquipements = computed(() => Array.isArray(a.value.equipements) ? a.value.equipements : [])
const aJoursDisponibles = computed(() => Array.isArray(a.value.joursDisponibles) ? a.value.joursDisponibles : [])
const aHorairesDisponibles = computed(() => Array.isArray(a.value.horairesDisponibles) ? a.value.horairesDisponibles : [])
const aProgramme = computed(() => Array.isArray(a.value.programme) ? a.value.programme : [])

type LocRaw = {
  nom?: string
  marque?: string
  modele?: string
  annee?: number
  carburant?: string
  transmission?: string
  categorie?: string
  ville?: string
  prixJour?: number
  prixSemaine?: number
  prixMois?: number
  caution?: number
  kilometrageInclus?: number
  supplementKm?: number
  devise?: string
  equipements?: string[]
  agenceNom?: string
  agenceId?: string
  annonceId?: string
  vehiculeId?: string
}
const loc = computed(() => raw.value as LocRaw)
const locEquipements = computed(() => Array.isArray(loc.value.equipements) ? loc.value.equipements : [])

const servicesLabels: Record<string, string> = {
  parking: 'Parking',
  petitDejeuner: 'Petit-dejeuner',
  roomService: 'Room service',
  vueSurMer: 'Vue sur mer',
}

const equipementsLabels: Record<string, string> = {
  wifi: 'Wi-Fi',
  climatisation: 'Climatisation',
  chauffage: 'Chauffage',
  piscine: 'Piscine',
  tv: 'Television',
  machineLaver: 'Machine a laver',
  laveVaisselle: 'Lave-vaisselle',
  machineCafe: 'Machine a cafe',
  bouilloire: 'Bouilloire',
  minibar: 'Minibar',
  coffre: 'Coffre-fort',
  salleSport: 'Salle de sport',
  balcon: 'Balcon',
  terrasse: 'Terrasse',
  canapeLit: 'Canape-lit',
  animauxAcceptes: 'Animaux acceptes',
}

const categoryLabel = (value: PartnerListingCategory) => {
  if (value === 'ACTIVITE') return 'Activite'
  if (value === 'HEBERGEMENT') return 'Hebergement'
  if (value === 'LOCATION_VOITURE') return 'Location de voiture'
  return 'VTC'
}

const categoryBadgeClass = (value: PartnerListingCategory) => {
  if (value === 'HEBERGEMENT') return 'bg-blue-light-50 text-blue-light-600 border-blue-light-100'
  if (value === 'ACTIVITE') return 'bg-warning-50 text-warning-600 border-warning-100'
  if (value === 'LOCATION_VOITURE') return 'bg-success-50 text-success-600 border-success-100'
  return 'bg-brand-50 text-brand-600 border-brand-100'
}

const statusLabel = (status: string) => {
  if (status === 'active') return 'active'
  if (status === 'inactive') return 'inactive'
  if (status === 'draft') return 'draft'
  if (status === 'rejected') return 'rejected'
  return status
}

const statusBadgeClass = (status: string) => {
  if (status === 'active') return 'bg-success-50 text-success-600'
  if (status === 'inactive') return 'bg-warning-50 text-warning-600'
  if (status === 'draft') return 'bg-gray-100 text-gray-600'
  if (status === 'rejected') return 'bg-error-50 text-error-600'
  return 'bg-gray-100 text-gray-600'
}

const moderationLabel = (status: string) => {
  if (status === 'approved') return 'Approuve'
  if (status === 'rejected') return 'Rejete'
  if (status === 'trashed') return 'Supprime'
  if (status === 'pending') return 'En attente'
  return status || 'En attente'
}

const moderationBadgeClass = (status: string) => {
  if (status === 'approved') return 'bg-success-50 text-success-600'
  if (status === 'rejected') return 'bg-error-50 text-error-600'
  if (status === 'trashed') return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
  if (status === 'pending') return 'bg-warning-50 text-warning-600'
  return 'bg-gray-100 text-gray-600'
}

const handleApprove = async () => {
  if (!listing.value) return
  updating.value = true
  try {
    await approvePartnerListing(listing.value.category, listing.value.id)
    listing.value = {
      ...listing.value,
      approved: true,
      status: 'active',
      rejectedReason: '',
      moderation: {
        ...listing.value.moderation,
        approved: true,
        status: 'approved',
        reason: '',
        reviewedAt: new Date(),
      },
    }
  } finally {
    updating.value = false
  }
}

const handleReject = async () => {
  if (!listing.value || !rejectReason.value.trim()) return
  updating.value = true
  try {
    await rejectPartnerListing(listing.value.category, listing.value.id, rejectReason.value.trim())
    listing.value = {
      ...listing.value,
      approved: false,
      status: 'rejected',
      rejectedReason: rejectReason.value.trim(),
      moderation: {
        ...listing.value.moderation,
        approved: false,
        status: 'rejected',
        reason: rejectReason.value.trim(),
        reviewedAt: new Date(),
      },
    }
    showReject.value = false
  } finally {
    updating.value = false
  }
}

const handleBack = async () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  await router.push('/partenaires')
}
</script>
