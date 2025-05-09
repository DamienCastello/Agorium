<template>
  <footer class="footer" @mousedown="handleClickOutsideNavbar">
    <div class="footer-content">
      <p class="footer-text">2025 Agorium v{{ agoriumVersion }}</p>
      <div class="social-links">
        <RouterLink to="/about-us" class="roadmap-link">
          <i class="fa-solid fa-question"></i> {{ $t('about.link') }}
        </RouterLink>
        <RouterLink to="/roadmap" class="roadmap-link">
          <i class="fas fa-map-signs"></i> Roadmap
        </RouterLink>
        <RouterLink to="/general-therms-service" class="roadmap-link">
          <i class="fa-solid fa-scale-balanced"></i> {{ $t('cgu.link') }}
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
  padding: 0 10px;
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

@media screen and (max-width: 768px) {
  .social-links {
  align-items: center;
}

  .roadmap-link {
  font-size: clamp(10px, 2vw, 20px);;
}

.footer-text {
  font-size: clamp(14px, 2vw, 20px);;
  text-align: center;
}
}

</style>