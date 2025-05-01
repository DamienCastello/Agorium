<template>
  <Layout>
    <template #header>
      <Navbar :isAdmin="authStore.isAdmin()" :isAuthenticated="authStore.isAuthenticated()" @logout="authStore.logout"
        class="pico" />
    </template>
    <template #main>
      <slot name="main">
        <RouterView />
      </slot>
    </template>
    <template #footer>
      <Footer class="pico" />
    </template>
  </Layout>
</template>

<script setup>
import Layout from "./components/Layout.vue";
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import { useAuthStore } from './stores/auth';
import { onMounted } from "vue";
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const authStore = useAuthStore();

onMounted(() => {
    // 🔥 Corrige le problème de reset de langue au reload
    const savedLang = localStorage.getItem('lang') || 'fr';
  locale.value = savedLang;

  console.log('savedLang:', savedLang);
console.log('current locale.value before:', locale.value);
locale.value = savedLang;
console.log('locale.value after set:', locale.value);

  // Optionnel : re-synchronise le cookie si absent
  const cookies = document.cookie.split(';').map(c => c.trim());
  const hasLangCookie = cookies.some(c => c.startsWith('lang='));
  if (!hasLangCookie) {
    document.cookie = `lang=${locale.value}; path=/; SameSite=Lax`;
  }
});
</script>