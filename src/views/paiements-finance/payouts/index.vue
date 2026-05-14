<template>
  <admin-layout>
    <page-breadcrumb page-title="Payouts" />
    <p class="mb-4 text-sm text-gray-500">Liste des virements groupes vers les prestataires.</p>
    <payouts-table />
  </admin-layout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import PayoutsTable from './components/PayoutsTable.vue'

defineOptions({ name: 'FinancePayoutsPage' })
</script>
