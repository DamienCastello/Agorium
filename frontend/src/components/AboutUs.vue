<template>
    <section class="about-message">
      <h1>{{ $t('about.title') }}</h1>
      <div class="admin-box">
        <p v-for="(line, index) in aboutLines" :key="index">{{ line }}</p>
        <div class="signature">
          <img :src="`${url.baseUrl}/uploads/avatars/admin.png`" alt="Admin Avatar" class="avatar" />
          <span class="admin-name">Admin</span>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { useI18n } from 'vue-i18n';
  import url from '@/utils/url';
  
  const { t } = useI18n();
  
  // ✅ ici on récupère le tableau d'une façon sûre
  const aboutLines = [t('about.line1'), t('about.line2'), t('about.line3'), t('about.line4'), t('about.line5'), t('about.line6')];
  </script>
  
  <style scoped>
  .about-message {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
  }
  .admin-box {
    background-color: rgba(255, 255, 255, 0.05);
    padding: 1.5rem;
    border-radius: 12px;
    font-size: 18px;
    color: #1f1f1f;
  }
  .signature {
    margin-top: 2rem;
    display: flex;
    align-items: center;
  }
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 0.75rem;
  }
  .admin-name {
    font-weight: bold;
    font-size: 1.1rem;
  }
  </style>