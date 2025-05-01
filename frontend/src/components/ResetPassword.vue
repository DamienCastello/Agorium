
  <template>
  <div class="signup-container pico" @mousedown="handleClickOutsideNavbar">
  <h1>{{ $t('auth.signup.reinitialize_password') }}</h1>
  
  <form @submit.prevent="submit">
    <fieldset>
      <label for="password">{{ $t('auth.signup.field_password') }}</label>
      <div class="password-container">
        <input id="password" :type="passwordType === 'visible' ? 'text' : 'password'" v-model="form.password"
          required />
        <SlashedEyeIcon v-if="passwordType === 'visible'" class="password-icon" @click="changeType('password')" />
        <EyeIcon v-if="passwordType === 'invisible'" class="password-icon" @click="changeType('password')" />
      </div>
    </fieldset>
    <fieldset>
      <label for="confirmPassword">{{ $t('auth.signup.field_password_confirm') }}</label>
      <div class="password-container">
        <input id="confirmPassword" :type="confirmPasswordType === 'visible' ? 'text' : 'password'"
          v-model="form.confirmPassword"
          :class="{ 'error-border': form.confirmPassword && form.confirmPassword !== form.password }" required />
        <SlashedEyeIcon v-if="confirmPasswordType === 'visible'" class="password-icon"
          @click="changeType('confirmPassword')" />
        <EyeIcon v-if="confirmPasswordType === 'invisible'" class="password-icon"
          @click="changeType('confirmPassword')" />
      </div>
    </fieldset>

  
    <button :disabled="loading || navbarStore.isMenuOpen || navbarStore.isTranslationOpen" type="submit">
      {{ $t('auth.signup.reinitialize') }}
    </button>
  </form>
  <p v-if="message" :class="{ error: isError, success: !isError }">{{ message }}</p>
  </div>
  <notifications position="bottom right" />
  </template>
  
  <script setup>
  import axios from "axios";
  import { ref, onMounted } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useNavbarStore } from "@/stores/navbar";
  import { useNotification } from "@kyvg/vue3-notification";
  import { useI18n } from "vue-i18n";
  import EyeIcon from './icons/EyeIcon.vue'
  import SlashedEyeIcon from "./icons/SlashedEyeIcon.vue";
  
  const router = useRouter();
  const route = useRoute();
  const form = ref({
  password: "",
  confirmPassword: "",
  });
  const passwordType = ref('invisible');
  const confirmPasswordType = ref('invisible');
  const navbarStore = useNavbarStore();
  const { notify } = useNotification();
  const { t } = useI18n();
  const token = ref('')
  const loading = ref(false)
  
  const changeType = (field) => {
  if (field === "password") {
  passwordType.value = passwordType.value === "visible" ? "invisible" : "visible";
  }
  if (field === "confirmPassword") {
  confirmPasswordType.value = confirmPasswordType.value === "visible" ? "invisible" : "visible";
  }
  };
  
  
  onMounted(() => {
    token.value = route.query.token || ''
    if (!token.value) {
      message.value = "Lien invalide."
      isError.value = true
    }
  })
  
  const submit = async () => {
    loading.value = true
    message.value = ''
    try {
      const response = await axios.post(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.VITE_BASE_URL}/api/v1/auth/reset-password?token=${token.value}`, {
        password: form.value.password,
        confirmPassword: form.value.confirmPassword
      })
  
      notify({
            title: t('auth.signup.reinitialize_password'),
            type: 'success',
            text: response.data.message,
        });
  
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      notify({
            title: t('auth.signup.reinitialize_password'),
            type: 'error',
            text: error.response.data.message,
        });
    } finally {
      loading.value = false
    }
  }
  
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
  .signup-container {
  max-width: 500px;
  }
  
  .password-container {
  position: relative;
  display: flex;
  align-items: center;
  }
  
  .password-container input {
  width: 100%;
  padding-right: 40px;
  }
  
  .error-border {
  border: 2px solid #ff4d4d;
  }
  
  .password-icon {
  position: absolute;
  right: 10px;
  top: 18px;
  cursor: pointer;
  font-size: 20px;
  color: #333;
  }
  
  </style>