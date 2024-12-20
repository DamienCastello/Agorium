<template>
  <Layout class="layout">
    <template #header>
      <Navbar />
    </template>
    <template #main>
      <RouterView />
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
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

header {
  flex-shrink: 0;
}

main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 16px;
  width: 100%;
}

footer {
  flex-shrink: 0;
  text-align: center;
  padding: 16px;
}
</style>