<template>
    <nav class="navbar">
      <ul class="navbar-title">
        <li><strong>Wake Up Normies</strong></li>
      </ul>
  
      <!-- Burger menu button (visible only on mobile view) -->
      <i class="fa-solid fa-bars burger-menu" @click="toggleMenu" 
        aria-label="Toggle navigation"
        :class="{ open: navbarStore.isMenuOpen }"></i>
  
      <ul :class="['navbar-links', { open: navbarStore.isMenuOpen }]">
        <li v-if="isAdmin">
          <RouterLink 
            to="/validations" 
            :class="{ 'active': isActiveRoute('/validations') }"
            @click="closeMenu">
            Validations
          </RouterLink>
        </li>
        <li>
          <RouterLink 
            to="/articles" 
            :class="{ 'active': isActiveRoute('/articles') }"
            @click="closeMenu">
            Articles
          </RouterLink>
        </li>
        <li v-if="isAuthenticated">
          <RouterLink 
            to="/new-article" 
            :class="{ 'active': isActiveRoute('/new-article') }"
            @click="closeMenu">
            New Article
          </RouterLink>
        </li>
        <li v-if="!isAuthenticated">
          <RouterLink 
            to="/login" 
            :class="{ 'active': isActiveRoute('/login') }"
            @click="closeMenu">
            Login
          </RouterLink>
        </li>
        <li v-if="!isAuthenticated">
          <RouterLink 
            to="/signup" 
            :class="{ 'active': isActiveRoute('/signup') }"
            @click="closeMenu">
            Signup
          </RouterLink>
        </li>
        <li v-if="isAuthenticated">
          <details role="menu" class="dropdown">
            <summary><span>Account</span></summary>
            <ul>
              <li>
                <RouterLink 
                  to="/profile" 
                  :class="{ 'active': isActiveRoute('/profile') }"
                  @click="closeMenu">
                  My Profile
                </RouterLink>
              </li>
              <li>
                <button @click="logout">Logout</button>
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
  
  defineProps(['isAuthenticated', 'isAdmin']);
  const navbarStore = useNavbarStore();
  const authStore = useAuthStore();
  const router = useRouter();
  const route = useRoute();

  const logout = () => {
    authStore.logout()
    router.push(`/login`);
  };
  
  // Helper function to detect the active route
  const isActiveRoute = (path) => route.path === path;
  
  const toggleMenu = (event) => {
    event.stopPropagation();
    navbarStore.toggleMenu();
  };
  
  const closeMenu = () => {
    navbarStore.closeMenu();
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
  
  .navbar-title li {
    font-size: 1.5rem;
    font-weight: bold;
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
  </style>
  