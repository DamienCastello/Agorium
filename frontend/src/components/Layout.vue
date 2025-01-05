<template>
  <div class="layout">
    <header class="header">
      <slot name="header"></slot>
    </header>
    <main class="main" @click="closeNavbar">
      <slot name="main"></slot>
    </main>
    <footer class="footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script setup>
import { useNavbarStore } from "../stores/navbar";

const navbarStore = useNavbarStore();

const closeNavbar = () => {
  if (navbarStore.isMenuOpen) {
    navbarStore.closeMenu();
    return;
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  flex: 0 0 auto;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
  padding: 0 0.5rem;
  position: sticky;
  top: 0;
  z-index: 1;
}

main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: auto;
  padding: 16px;
  text-align: center;
}

footer {
  flex-shrink: 0;
  text-align: center;
  padding: 16px;
  position: sticky;
  bottom: 0;
  z-index: 1;
}

</style>