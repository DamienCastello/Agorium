<template>
  <div class="signup-container pico" @mousedown="handleClickOutsideNavbar">
    <h1>{{ $t('auth.signup.title') }}</h1>
    <form @submit.prevent="handleSignup">
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
        <input id="password" type="password" v-model="form.password" required />
      </fieldset>

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
      <FadeSlideTransition>
      <div v-if="avatarFile">
        <img :src="avatarPreviewUrl" alt="avatar" class="avatar" />
      </div>
    </FadeSlideTransition>
      <button :disabled="navbarStore.isMenuOpen || navbarStore.isTranslationOpen" type="submit">{{
        $t('auth.signup.button') }}</button>
    </form>
  </div>
  <notifications position="bottom right" />
</template>

<script setup>
import axios from "axios";
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import url from "@/utils/url";
import { useNavbarStore } from "@/stores/navbar";
import { useNotification } from "@kyvg/vue3-notification";
import FadeSlideTransition from "@/transitions/FadeSlideTransition.vue";
import { useI18n } from "vue-i18n";

const router = useRouter();
const form = ref({
  pseudo: "",
  email: "",
  password: ""
});
const avatarFile = ref(null);
const avatarPreviewUrl = ref(null);
const navbarStore = useNavbarStore();
const { notify } = useNotification();
const { t } = useI18n();

watch(avatarPreviewUrl, (newUrl, oldUrl) => {
  if (oldUrl) {
    URL.revokeObjectURL(oldUrl);
  }
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

const handleSignup = async () => {
  try {
    const formData = new FormData();
    formData.append("pseudo", form.value.pseudo);
    formData.append("email", form.value.email);
    formData.append("password", form.value.password);
    if (avatarFile.value) {
      formData.append("avatar", avatarFile.value);
    }

    const response = await axios.post(`${url.baseUrl}:${url.portBack}/api/v1/auth/signup`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true
    });

    notify({
      title: t('notification.title.signup'),
      type: 'success',
      text: 'Account created successfully !',
    });

    router.push("/login");
  } catch (error) {
    notify({
      title: t('notification.title.signup'),
      type: 'error',
      text: error.response.data.message,
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
</script>

<style scoped>
.file-upload {
  position: relative;
  display: inline-block;
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