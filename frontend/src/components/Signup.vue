<template>
  <el-dialog v-model="isDialogVisible" title="Welcome" width="95%">
    <div>
      <p>{{ $t('cgu.introduction') }}</p>
      <p><strong>{{ $t('cgu.section1.title') }}</strong></p>
      <p>{{ $t('cgu.section1.content') }}</p>
      <p><strong>{{ $t('cgu.section2.title') }}</strong></p>
      <p>{{ $t('cgu.section2.content') }}</p>
      <p><strong>{{ $t('cgu.section3.title') }}</strong></p>
      <p>{{ $t('cgu.section3.content') }}</p>
      <p><strong>{{ $t('cgu.section4.title') }}</strong></p>
      <p>{{ $t('cgu.section4.content') }}</p>
      <p><strong>{{ $t('cgu.section5.title') }}</strong></p>
      <p>{{ $t('cgu.section5.content') }}</p>
      <p>{{ $t('cgu.conclusion') }}</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="isDialogVisible = false">{{ $t('auth.signup.close') }}</el-button>
        <el-button type="primary" @click="acceptCGU">{{ $t('auth.signup.accept') }}</el-button>
      </div>
    </template>
  </el-dialog>
  <div class="signup-container pico" @mousedown="handleClickOutsideNavbar">


    <h1>{{ $t('auth.signup.title') }}</h1>

    <form @submit.prevent="handleSignup">
      <!-- Form Fields -->
      <fieldset>
        <label for="pseudo">{{ $t('auth.signup.field_pseudo') }}</label>
        <input id="pseudo" type="text" v-model="form.pseudo" required />
      </fieldset>
      <fieldset>
        <label for="email">{{ $t('auth.signup.field_email') }}</label>
        <input id="email" type="email" v-model="form.email" required />
      </fieldset>
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
        <p v-if="form.password !== form.confirmPassword && form.password && form.confirmPassword">{{ $t('auth.signup.password_mismatch') }}</p>
      </fieldset>
      
      <FadeSlideTransition>
        <div v-if="avatarFile">
          <img :src="avatarPreviewUrl" alt="avatar" class="avatar" />
        </div>
      </FadeSlideTransition>

      <!-- File Upload Section -->
      <fieldset>
        <div class="file-upload">
          <label for="avatar">{{ $t('auth.signup.field_avatar') }}</label>
          <input type="file" id="fileInput" hidden @change="handleFileChange"
            :disabled="navbarStore.isMenuOpen || navbarStore.isTranslationOpen" />
          <label for="fileInput" class="custom-label"
            :class="{ 'disabled': navbarStore.isMenuOpen || navbarStore.isTranslationOpen }">
            {{ avatarFile ? avatarFile.name : $t('auth.signup.placeholder_file') }}
          </label>
        </div>
      </fieldset>

      <el-button plain @click="isDialogVisible = true">
        {{ $t('auth.signup.read_cgu') }}
      </el-button>


      <fieldset>
        <el-checkbox :model-value="acceptedCGU" @change="handleCGUCheckbox" class="cgu">
          {{ $t('auth.signup.accept_cgu') }}
        </el-checkbox>
      </fieldset>

      <button :disabled="isFormInvalid || navbarStore.isMenuOpen || navbarStore.isTranslationOpen" type="submit">
        {{ $t('auth.signup.button') }}
      </button>
    </form>

  </div>
  <notifications position="bottom right" />
</template>

<script setup>
import axios from "axios";
import { ref, watch, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import url from "@/utils/url";
import { useNavbarStore } from "@/stores/navbar";
import { useNotification } from "@kyvg/vue3-notification";
import FadeSlideTransition from "@/transitions/FadeSlideTransition.vue";
import { useI18n } from "vue-i18n";
import EyeIcon from './icons/EyeIcon.vue'
import SlashedEyeIcon from "./icons/SlashedEyeIcon.vue";

const router = useRouter();
const form = ref({
  pseudo: "",
  email: "",
  password: "",
  confirmPassword: "",
});
const passwordType = ref('invisible');
const confirmPasswordType = ref('invisible');
const avatarFile = ref(null);
const avatarPreviewUrl = ref(null);
const acceptedCGU = ref(false);
const isDialogVisible = ref(false);
const navbarStore = useNavbarStore();
const { notify } = useNotification();
const { t } = useI18n();


const acceptCGU = () => {
  acceptedCGU.value = true;
  isDialogVisible.value = false;
};

watch(avatarPreviewUrl, (newUrl, oldUrl) => {
  if (oldUrl) {
    URL.revokeObjectURL(oldUrl);
  }
});

const changeType = (field) => {
  if (field === "password") {
    passwordType.value = passwordType.value === "visible" ? "invisible" : "visible";
  }
  if (field === "confirmPassword") {
    confirmPasswordType.value = confirmPasswordType.value === "visible" ? "invisible" : "visible";
  }
};

const isFormInvalid = computed(() => {
  return (
    form.value.password !== form.value.confirmPassword ||
    !form.value.pseudo ||
    !form.value.email ||
    !form.value.password ||
    !form.value.confirmPassword ||
    !acceptedCGU.value
  );
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    avatarFile.value = file;
    avatarPreviewUrl.value = URL.createObjectURL(file);
  } else {
    avatarFile.value = null;
    avatarPreviewUrl.value = null;
  }
  document.querySelector('.custom-label').textContent = file?.name;
};

const handleCGUCheckbox = (value) => {
  if (!acceptedCGU.value) {
    // Si pas encore accepté, ouvrir les CGU et empêcher la validation directe
    isDialogVisible.value = true;
  } else {
    // Sinon, on inverse l'état normalement
    acceptedCGU.value = value;
  }
};

const handleSignup = async () => {
  if (!acceptedCGU.value) {
    notify({
      title: t('notification.title.signup'),
      type: 'error',
      text: t('auth.signup.error_accept_cgu') || 'Please accept the CGU before signing up.',
    });
    return;
  }

  if (form.value.password !== form.value.confirmPassword) {
    notify({
      title: t('notification.title.signup'),
      type: 'error',
      text: t('auth.signup.error_password_match') || 'Passwords do not match.',
    });
    return;
  }

  try {
    const formData = new FormData();
    formData.append("pseudo", form.value.pseudo);
    formData.append("email", form.value.email);
    formData.append("password", form.value.password);
    formData.append("confirmPassword", form.value.confirmPassword);
    if (avatarFile.value) {
      formData.append("avatar", avatarFile.value);
    }

    await axios.post(`${url.baseUrl}/api/v1/auth/signup?lang=${localStorage.getItem('lang')}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true
    });
    notify({
      title: t('notification.title.signup'),
      type: 'success',
      text: t('notification.text.signup'),
    });
    setTimeout(() => {
      router.push("/login");
        }, 3000);


  } catch (error) {
    notify({
      title: t('notification.title.signup'),
      type: 'error',
      text: error.response?.data?.message || 'Signup failed.',
    });
  }
};

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

onMounted(() => window.scrollTo(0, 0));
</script>

<style scoped>
.signup-container {
  max-width: 500px;
}

.file-upload {
  position: relative;
  display: inline-block;
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

.custom-label {
  display: inline-block;
  padding: 8px 12px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s, border-color 0.3s, color 0.3s;
}

.custom-label:hover {
  background-color: #e9e9e9;
}

.custom-label::after {
  content: 'Choisir un fichier';
  display: inline-block;
  margin-left: 10px;
  font-size: 16px;
  background-color: rgb(64, 64, 191);
  color: white;
  border: 1px solid rgb(63, 51, 131);
  border-radius: 5px;
  cursor: pointer;
  padding: 4px 6px;
  transition: background-color 0.2s, border-color 0.2s;
}

.custom-label.disabled {
  background-color: #f0f0f0;
  border-color: #ddd;
  color: #aaa;
  cursor: not-allowed;
  pointer-events: none;
}

.custom-label.disabled::after {
  background-color: #9980f2;
  opacity: 0.5;
}

.avatar {
  max-width: 300px;
  max-height: 300px;
  margin-bottom: 15px;
  border: 1px solid grey;
}
</style>