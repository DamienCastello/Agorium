<template>
  <div class="pico">
    <div @mousedown="handleClickOutsideNavbar">
      <h1>{{ $t('auth.login.title') }}</h1>
      <form @submit.prevent="handleLogin">
        <fieldset>
          <label for="email">{{ $t('auth.login.field_email') }}:</label>
          <input id="email" v-model="email" type="email" />
        </fieldset>
        <fieldset>
          <label for="password">{{ $t('auth.login.field_password') }}:</label>
          <input id="password" v-model="password" type="password" />
        </fieldset>
        <button :disabled="navbarStore.isMenuOpen" type="submit">{{ $t('auth.login.title') }}</button>
      </form>
    </div>
    <notifications position="bottom right" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { useNavbarStore } from '../stores/navbar';
import { useNotification } from "@kyvg/vue3-notification";
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();
const navbarStore = useNavbarStore();
const { notify } = useNotification();
const { t } = useI18n();

const handleLogin = async () => {
  try {
    await authStore.login({ email: email.value, password: password.value });
    router.push('/articles');
  } catch (error) {
    notify({
      title: t('notification.title.login'),
      type: 'error',
      text: error.response.data.message,
    });
  }
};

onMounted(() => window.scrollTo(0, 0));

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