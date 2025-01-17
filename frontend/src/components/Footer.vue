<template>
  <footer class="footer" @mousedown="handleClickOutsideNavbar">
    <div class="footer-content">
      <p class="footer-text">2024 Wake up normies</p>
      <div class="social-links">
        <a @click.prevent="handleClickOutsideNavbar" href="https://www.linkedin.com/in/castello-damien/" target="_blank" aria-label="LinkedIn">
          <i class="fab fa-linkedin"></i> LinkedIn
        </a>
        <a @click.prevent="handleClickOutsideNavbar" href="https://github.com/DamienCastello" target="_blank" aria-label="GitHub">
          <i class="fab fa-github"></i> GitHub
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
  import { useNavbarStore } from '@/stores/navbar';

  const navbarStore = useNavbarStore();
  const handleClickOutsideNavbar = (event) => {
    if (navbarStore.isMenuOpen) {
      event.preventDefault();
      event.stopPropagation();
      navbarStore.closeMenu();
    }
    if (navbarStore.isTranslationOpen) {
      event.preventDefault();
      event.stopPropagation();
      navbarStore.closeTranslation();
    } else {
      return true;
    }
  };
</script>


<style scoped>
.footer {
  background-color: #222;
  color: #fff;
  padding: 20px 0;
  text-align: center;
  font-size: 14px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-text {
  margin-bottom: 10px;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}

.social-links a {
  color: #fff;
  font-size: 18px;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.social-links a i {
  margin-right: 8px;
}

.social-links a:hover {
  color: #ddd;
  transition: color 0.3s ease;
}
</style>