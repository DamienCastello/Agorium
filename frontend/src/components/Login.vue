<template>
  <div class="pico login-container">
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
        <p>
          <RouterLink to="/forgot-password">
            {{ $t('auth.login.forgot_password') }}
          </RouterLink>
        </p>

        <button :disabled="!password || navbarStore.isMenuOpen" type="submit">{{ $t('auth.login.title') }}</button>
      </form>
      <!-- UNCOMMENT ONLY TO CHECK DELETION OF AVATAR PENDING WHEN USER CREATION EXPIRED  -->
       <!--
      <button v-if="!isProd" @click="cleanup">
        ⚙️ Cleanup pending avatars (dev & preprod)
      </button> 
      -->
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

/*
import url from '@/utils/url';

const isProd = import.meta.env.PROD;

async function cleanup() {
  await fetch(`${url.baseUrl}/api/v1/auth/cleanup-avatars`, { method: 'POST' });
  alert('Cleanup triggered');
}
*/

const handleLogin = async () => {
  try {
    const user = await authStore.login({ email: email.value, password: password.value });
    if (user.emailVerified) {
      router.push('/articles');
    } else {
      router.push('/verify-email');
    }

  } catch (error) {
    notify({
      title: t('notification.title.login'),
      type: 'error',
      text: error?.response?.data?.message,
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

<style scoped>
.login-container {
  width: min(300px, 100%);
}
</style>