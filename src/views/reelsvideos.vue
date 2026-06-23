<template>
  <AdminLayout>
    <div class="min-w-0 overflow-x-hidden">
      <PageBreadcrumb page-title="Reels Videos" />
      <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Liste des videos provenant de la collection <span class="font-medium text-gray-700 dark:text-gray-200">social_content</span>.
      </p>
      <SocialContents />
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import SocialContents from '@/components/socialContents.vue'

defineOptions({ name: 'ReelsVideosPage' })
</script>
