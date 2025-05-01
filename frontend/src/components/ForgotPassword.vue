<template>
    <div class="signup-container pico" @mousedown="handleClickOutsideNavbar">
        <h1>{{ $t('auth.login.forgot_password') }}</h1>

        <form @submit.prevent="submit">
            <!-- Form Fields -->
            <fieldset>
                <label for="email">{{ $t('auth.signup.field_email') }}</label>
                <input id="email" type="email" v-model="email" required />
            </fieldset>

            <button :disabled="loading || navbarStore.isMenuOpen || navbarStore.isTranslationOpen" type="submit">
                {{ $t('auth.login.reinitialize_link') }}
            </button>
        </form>

    </div>
    <notifications position="bottom right" />
</template>

<script setup>
import axios from "axios";
import { ref } from "vue";
import { useNavbarStore } from "@/stores/navbar";
import { useNotification } from "@kyvg/vue3-notification";
import { useI18n } from "vue-i18n";

const email = ref('')
const navbarStore = useNavbarStore();
const { notify } = useNotification();
const { t } = useI18n();
const loading = ref(false);



const submit = async () => {
    loading.value = true


    try {
        const response = await axios.post(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.VITE_BASE_URL}/api/v1/auth/forgot-password?lang=${localStorage.getItem('selectedLanguage')}`, { email: email.value })
        notify({
            title: t('notification.title.login'),
            type: 'success',
            text: response.data.message,
        });
    } catch (err) {
        notify({
            title: t('notification.title.login'),
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

.error-border {
    border: 2px solid #ff4d4d;
}

h1 {
    font-size: clamp(20px, 1.5vw, 40px);
}
</style>