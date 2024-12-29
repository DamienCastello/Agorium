<template>
  <Layout class="layout">
    <template #header>
      <Navbar :isAuthenticated="authStore.isAuthenticated()" @logout="authStore.logout" />
    </template>
    <template #main>
      <div class="content">
        <slot name="main">
          <RouterView />
        </slot>
      </div>
    </template>
    <template #footer>
      <Footer></Footer>
    </template>
  </Layout>
</template>

<script setup>
import Layout from "./components/Layout.vue";
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
</script>

