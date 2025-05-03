<template>
  <nav class="navbar" @click="handleClickOutsideNavbar">
    <ul class="navbar-title">
      <li>
        <RouterLink to="/articles" class="title-link" @click="closeMenu">
          <strong>Agorium</strong>
        </RouterLink>
      </li>
      <div class="language-selector">
        <div class="dropdown-translation" @click="toggleTranslation">
          <i class="fa-solid fa-language"></i>
          <ul v-if="navbarStore.isTranslationOpen" :class="{ open: navbarStore.isTranslationOpen }">
            <li @click.stop="changeLanguage('en')">
              <img src="/flag_us.png" alt="US-flag" />{{ $t('navigation.language_en') }}
            </li>
            <li @click.stop="changeLanguage('fr')">
              <img src="/flag_fr.png" alt="French-flag" />{{ $t('navigation.language_fr') }}
            </li>
          </ul>
        </div>
      </div>
    </ul>

    <!-- Burger menu button (visible only on mobile view) -->
    <i class="fa-solid fa-bars burger-menu" @click="toggleMenu" aria-label="Toggle navigation"
      :class="{ open: navbarStore.isMenuOpen }"></i>

    <ul :class="['navbar-links', { open: navbarStore.isMenuOpen }]">
      <li v-if="isAdmin">
        <RouterLink to="/validations" :class="{ 'active': isActiveRoute('/validations') }" @click="closeMenu">
          {{ $t('navigation.validations') }}
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/articles" :class="{ 'active': isActiveRoute('/articles') }" @click="closeMenu">
          {{ $t('navigation.articles') }}
        </RouterLink>
      </li>
      <li v-if="isAuthenticated">
        <RouterLink to="/new-article" :class="{ 'active': isActiveRoute('/new-article') }" @click="closeMenu">
          {{ $t('navigation.publish') }}
        </RouterLink>
      </li>
      <li v-if="!isAuthenticated">
        <RouterLink to="/login" :class="{ 'active': isActiveRoute('/login') }" @click="closeMenu">
          {{ $t('navigation.login') }}
        </RouterLink>
      </li>
      <li v-if="!isAuthenticated">
        <RouterLink to="/signup" :class="{ 'active': isActiveRoute('/signup') }" @click="closeMenu">
          {{ $t('navigation.signup') }}
        </RouterLink>
      </li>
      <li v-if="isAuthenticated">
        <details role="menu" class="dropdown">
          <summary @click="closeTranslation"><span>{{ $t('navigation.account') }}</span></summary>
          <ul>
            <li>
              <RouterLink :to="`/profile/${authStore.user?.pseudo}`"
                :class="{ 'active': isActiveRoute(`/profile/${authStore.user?.pseudo}`) }" @click="handleClick($event)">
                {{ $t('navigation.profile') }}
              </RouterLink>
            </li>
            <li>
              <button @click="logout">{{ $t('navigation.logout') }}</button>
            </li>
            <li>
              <button class="delete-button" @click="deleteAccount">{{ $t('navigation.delete_account') }}</button>
            </li>
            <li>
            </li>
          </ul>
        </details>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { useNavbarStore } from '../stores/navbar';
import { useAuthStore } from '@/stores/auth';
import { useRoute, useRouter } from 'vue-router';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import url from '@/utils/url';
import axios from 'axios';
import { useNotification } from "@kyvg/vue3-notification";

defineProps(['isAuthenticated', 'isAdmin']);

const navbarStore = useNavbarStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const selectedLanguage = ref('fr');
const { locale, t } = useI18n();
const { notify } = useNotification();


const changeLanguage = async (lang) => {
  if (lang === 'en') {
    selectedLanguage.value = 'English';
    localStorage.setItem('lang', 'en');
    locale.value = lang;
  } else if (lang === 'fr') {
    selectedLanguage.value = 'Français';
    localStorage.setItem('lang', 'fr');
    locale.value = lang;
  }

  try {
    await axios.post(`${url.baseUrl}/api/v1/set-language`, { language: locale.value }, { withCredentials: true });
    notify({
            title: t('notification.title.login'),
            type: 'success',
            text: response.data.message,
        });
  } catch (error) {
    notify({
            title: t('notification.title.login'),
            type: 'error',
            text: error.response.data.message,
        });
  }

  navbarStore.closeTranslation();
};

const handleClick = (event) => {
  closeMenu();
  closeDropdown(event);
};

const logout = () => {
  authStore.logout();
  router.push(`/login`);
};

const deleteAccount = () => {
  router.push(`/profile/${authStore.user?.pseudo}/informations`);
};

// Helper function to detect the active route
const isActiveRoute = (path) => route.path === path;

const toggleMenu = (event) => {
  event.stopPropagation();
  navbarStore.toggleMenu();
};

const toggleTranslation = (event) => {
  event.stopPropagation();
  navbarStore.toggleTranslation();
};

const closeMenu = () => {
  navbarStore.closeMenu();
  navbarStore.closeTranslation();
};

const closeTranslation = () => {
  navbarStore.closeTranslation();
};

const closeDropdown = (event) => {
  const dropdown = event.target.closest('details');
  if (dropdown && dropdown.hasAttribute('open')) {
    dropdown.removeAttribute('open');
  }
};

const handleClickOutsideNavbar = (event) => {
  // Ignore si clic sur l'icône burger
  if (event.target.closest('.burger-menu')) {
    return;
  }

  const isInsideDropdown = event.target.closest('.dropdown-translation') || event.target.closest('.navbar-links');

  if (!isInsideDropdown) {
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
  }
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;
  position: relative;
}

.navbar-title {
  list-style: none;
  margin: 0;
  padding: 0;
}

.title-link {
  text-decoration: none;
  color: #4040BF;
  font-weight: bold;
  font-size: 1.5rem;
  cursor: pointer;
}

.title-link:active,
.title-link:focus,
.title-link:visited {
  color: #4040BF;
}

.navbar-links {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
  transition: max-height 0.3s ease-out;
}

.navbar-links a {
  text-decoration: none;
  font-size: 1rem;
}

.navbar-links a.active {
  font-weight: bold;
}

.dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.burger-menu {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.burger-menu:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.6);
  border-radius: 8px;
  padding: 4px;
}

.burger-menu.open::before {
  transform: rotate(45deg) translate(5px, 5px);
}

.burger-menu.open::after {
  transform: rotate(-45deg) translate(5px, -5px);
}

.burger-menu.open {
  background: transparent;
}

.navbar-links.open {
  display: flex;
  flex-direction: column;
  max-height: 500px;
}

.navbar-links {
  display: none;
  flex-direction: column;
  gap: 1rem;
  background-color: #fff;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  padding: 30px;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

@media (min-width: 769px) {
  .navbar-links {
    display: flex;
    flex-direction: row;
    position: static;
    background-color: transparent;
    box-shadow: none;
    width: auto;
    padding: 0;
  }
}

.navbar-links.open {
  display: flex;
}

@media (max-width: 768px) {
  .burger-menu {
    display: block;
  }
}

.dropdown-translation {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 50px;
  height: 40px;
  font-size: 30px;
  border: 2px solid rgb(70, 70, 70);
  border-radius: 10px;
  padding: 10px;
  margin: 5px 5px 0px 5px;
  background-color: #e7e7e7;
  cursor: pointer;
}

.dropdown-translation:hover {
  background-color: #d1d1d1;
  transform: scale(1.05);
}

.dropdown-translation ul {
  display: flex;
  flex-direction: column;
  position: absolute;
  list-style: none;
  top: 38px;
  left: 3px;
  margin: 0;
  padding: 0;
  background: white;
  border: 1px solid #ccc;
  min-height: 160px;
}

.dropdown-translation ul li {
  font-size: 14px;
  padding: 3px !important;
  margin: 0px !important;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-height: 70px;
}

.delete-button {
  background-color: darkred;
  border: 2px solid brown;
}

.delete-button:hover {
  background-color: rgb(112, 0, 0);
  border: 2px solid brown;
}

@media screen and (max-width: 768px) and (orientation: landscape) {
  .navbar-links.open {
    flex-direction: row !important;
    max-height: 200px;
    padding: 10px;
    justify-content: center;
  }

  .navbar-links.open li {
    margin: 0 10px;
  }
}

@media screen and (max-width: 768px) and (orientation: portrait) {
  .navbar-links.open {
    padding: 5px;
  }
}


</style>