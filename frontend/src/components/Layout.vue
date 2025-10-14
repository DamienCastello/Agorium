<template>
  <div class="layout">
    <header class="header">
      <div class="pico">
        <slot name="header"></slot>
      </div>
    </header>
    <main class="main" @click="closeNavbar">
        <slot name="main"></slot>
    </main>
    <footer class="footer">
      <div class="pico">
        <slot name="footer"></slot>
      </div>
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
  if (navbarStore.isTranslationOpen) {
    navbarStore.closeTranslation();
    return;
  }
};
</script>

<style>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100vw;
}

.header {
  flex: 0 0 auto;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
  padding: 0 0.5rem;
  position: sticky;
  top: 0;
  z-index: 8;
}

main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: auto;
  padding: 8px;
  text-align: center;
}

footer {
  flex-shrink: 0;
  text-align: center;
  padding: 16px;
}

:root {
  --primary: #6610f2;
  --border-radius: 0.375rem;
}

.pico button,
.pico input[type="button"],
.pico input[type="submit"] {
  background-color: rgb(64, 64, 191);
  color: white;
  border: 1px solid rgb(69, 50, 175);
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

input[type="checkbox"].switch:checked {
  background-color: rgb(64, 64, 191);
  border-color: #3e0ca3;
}


.pico button:hover,
.pico input[type="button"]:hover,
.pico input[type="submit"]:hover {
  background-color: rgb(87, 64, 191);
  border-color: rgb(69, 50, 175);
  color: white;
}

.pico form button {
  background-color: rgb(64, 64, 191) !important;
  color: white !important;
  border: 1px solid rgb(69, 50, 175) !important;
  cursor: pointer !important;
  transition: background-color 0.2s, border-color 0.2s !important;
}

.pico form button:hover {
  background-color: rgb(87, 64, 191) !important;
  border-color: rgb(69, 50, 175) !important;
}

.pico form button:disabled {
  background-color: #9980f2;
  border-color: #9980f2;
  color: white;
  cursor: not-allowed;
}

.pico button:disabled,
.pico input[type="button"]:disabled,
.pico input[type="submit"]:disabled {
  background-color: #9980f2;
  border-color: #9980f2;
  color: white;
  cursor: not-allowed;
}

.pico input:focus,
.pico textarea:focus,
.pico select:focus {
  border: 2px solid rgb(59, 50, 175);
  outline: none;
  box-shadow: 0 0 4px rgb(64, 64, 191);
}

.pico a {
  color: rgb(64, 64, 191);
  text-decoration: none;
  transition: color 0.2s;
}

.pico a:hover {
  color: #520dc2;
}

.pico a:active {
  color: #3e0ca3;
}

.pico select:hover,
.pico button:hover,
.pico input[type="button"]:hover,
.pico input[type="submit"]:hover {
  border-color: #520dc2;
}

.pico input.switch {
  background-color: rgb(64, 64, 191);
  border: none;
  color: var(--muted);
  cursor: pointer;
}

.pico input.switch:focus {
  box-shadow: 0 0 4px rgb(64, 64, 191);
  outline: none;
}

.pico {
  all: revert;
}
</style>
