<template>
    <div>
      <h1>Login</h1>
      <form @submit.prevent="handleLogin">
        <div>
          <label for="email">Email:</label>
          <input id="email" v-model="email" type="email" />
        </div>
        <div>
          <label for="password">Password:</label>
          <input id="password" v-model="password" type="password" />
        </div>
        <button type="submit">Login</button>
        <p v-if="error">{{ error }}</p>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useAuthStore } from '../stores/auth';
  import { useRouter } from 'vue-router';
  
  const email = ref('');
  const password = ref('');
  const error = ref(null);
  const authStore = useAuthStore();
  const router = useRouter();
  
  const handleLogin = async () => {
    try {
      await authStore.login({ email: email.value, password: password.value });
      router.push('/articles');
    } catch (err) {
      error.value = 'Invalid email or password.';
    }
  };
  </script>