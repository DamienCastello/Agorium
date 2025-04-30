<template>
    <section class="max-w-3xl mx-auto p-4 sm:p-6 md:p-8 text-neutral-900 dark:text-neutral-100">
      <h1 class="text-3xl font-bold mb-6">{{ t('cgu.title') }}</h1>
      <p class="mb-6">{{ t('cgu.introduction') }}</p>
  
      <div v-for="n in 5" :key="n" class="mb-6">
        <h2 class="text-xl font-semibold mb-2">{{ t(`cgu.section${n}.title`) }}</h2>
        <p>{{ t(`cgu.section${n}.content`) }}</p>
      </div>
  
      <p class="mt-10 italic">{{ t('cgu.conclusion') }}</p>
    </section>
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  
  const { t } = useI18n()

  onMounted(() => window.scrollTo(0, 0));
  </script>
  
  <style scoped>
  section {
    line-height: 1.6;
    max-width: 800px;
  }
  </style>