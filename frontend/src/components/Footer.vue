<template>
  <footer class="footer" @mousedown="handleClickOutsideNavbar">
    <div class="footer-content">
      <p class="footer-text">2025 Agorium v{{ agoriumVersion }}</p>
      <div class="social-links">
        <RouterLink to="/roadmap" class="roadmap-link">
          <i class="fas fa-map-signs"></i> Roadmap
        </RouterLink>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useNavbarStore } from '@/stores/navbar';
import { RouterLink } from 'vue-router';

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

const agoriumVersion = window.environment?.VITE_AGORIUM_VERSION || 'x.x.x';
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
  color: #fff;
  margin-bottom: 10px;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}

.roadmap-link {
  color: #fff;
  font-size: 18px;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.roadmap-link i {
  margin-right: 8px;
}

.roadmap-link:hover {
  color: #ddd;
  transition: color 0.3s ease;
}
</style>
