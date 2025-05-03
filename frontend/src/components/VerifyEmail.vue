<template>
    <main class="verify-email" @mousedown="handleClickOutsideNavbar">
      <h1>{{ $t('auth.signup.verify_email_title') }}</h1>
  
      <p v-if="loading">{{ $t('auth.signup.verify_email_loading') }}</p>
      <p v-else-if="success" class="success">✅ {{ $t('auth.signup.verify_email_success') }}</p>
      <p v-else class="error">❌ {{ $t('auth.signup.not_verified') }}</p>
  
      <button class="login-button" :disabled="!success"><router-link to="/login">{{ $t('auth.login.title') }}</router-link></button>
    </main>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import axios from 'axios'
  import { useNavbarStore } from '@/stores/navbar'
  import url from '@/utils/url'
  
  const route = useRoute()
  const navbarStore = useNavbarStore();
  
  const loading = ref(true)
  const success = ref(false)

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
  
  onMounted(async () => {
    const token = route.query.token
  
    if (!token) {
      loading.value = false
      return
    }
  
    try {
      const res = await axios.get(`${url.baseUrl}/api/v1/auth/verify-email?token=${token}`)
      if (res.status === 200) {
        success.value = true
      }
    } catch (e) {
      success.value = false
    } finally {
      loading.value = false
    }
  })
  </script>
  
  <style scoped>
  .verify-email {
    max-width: 500px;
    margin: 4rem auto;
    text-align: center;
  }
  .success {
    color: green;
  }
  .error {
    color: red;
  }

  .login-button {
    margin-left: 10px;
    
    background-color: rgb(64, 64, 191);
    border: 1px solid rgb(63, 51, 131);
    border-radius: 5px;
    cursor: pointer;
    padding: 10px 15px;
    transition: background-color 0.2s, border-color 0.2s;
  }

  .login-button:hover {
    background-color: rgb(49, 49, 146);
    border: 1px solid rgb(56, 45, 119);
  }

  .login-button a {
    text-decoration: none;
    color: white;
    font-size: 16px;
  }
  </style>
  