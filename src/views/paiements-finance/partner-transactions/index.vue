<template>
  <admin-layout>
    <page-breadcrumb page-title="Transactions partenaires" />
    <p class="mb-4 text-sm text-gray-500">Historique des paiements vers les partenaires.</p>
    <partner-transactions-table />
  </admin-layout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import PartnerTransactionsTable from './components/PartnerTransactionsTable.vue'

defineOptions({ name: 'PartnerTransactionsPage' })
</script>
