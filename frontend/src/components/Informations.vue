<template>

    <div class="signup-container pico" @mousedown="handleClickOutsideNavbar">

        <h1>{{ $t('auth.signup.update_title') }}</h1>
        <div class="clickable"
                @click="user?.pseudo === authStore.user?.pseudo && selectAvatar()">
                <img :src="user?.avatar ? `${url.baseUrl}/${user.avatar}` : `${url.baseUrl}/uploads/avatars/utilisateur.png`"
                    :key="user?.pseudo" alt="user-avatar" class="avatar-image">
            </div>
        <form @submit.prevent="handleSubmit">


            <input type="file" name="avatar" ref="avatarInput" @change="updateAvatar" style="display: none"
                accept="image/*" />
            <!-- Form Fields -->
            <fieldset>
                <label for="pseudo">{{ $t('auth.signup.field_pseudo') }}</label>
                <input id="pseudo" type="text" v-model="form.pseudo" required />
            </fieldset>

            <fieldset>
                <label for="password">{{ $t('auth.signup.field_password') }}</label>
                <div class="password-container">
                    <input id="password" :type="passwordType === 'visible' ? 'text' : 'password'"
                        v-model="form.password" required />
                    <SlashedEyeIcon v-if="passwordType === 'visible'" class="password-icon"
                        @click="changeType('password')" />
                    <EyeIcon v-if="passwordType === 'invisible'" class="password-icon"
                        @click="changeType('password')" />
                </div>
            </fieldset>
            <fieldset>
                <label for="confirmPassword">{{ $t('auth.signup.field_password_confirm') }}</label>
                <div class="password-container">
                    <input id="confirmPassword" :type="confirmPasswordType === 'visible' ? 'text' : 'password'"
                        v-model="form.confirmPassword"
                        :class="{ 'error-border': form.confirmPassword && form.confirmPassword !== form.password }"
                        required />
                    <SlashedEyeIcon v-if="confirmPasswordType === 'visible'" class="password-icon"
                        @click="changeType('confirmPassword')" />
                    <EyeIcon v-if="confirmPasswordType === 'invisible'" class="password-icon"
                        @click="changeType('confirmPassword')" />       
                </div>
                <p v-if="form.password !== form.confirmPassword && form.password && form.confirmPassword">{{ $t('auth.signup.password_mismatch') }}</p>
            </fieldset>


            <button :disabled="isFormInvalid || navbarStore.isMenuOpen || navbarStore.isTranslationOpen" type="submit">
                {{ $t('auth.signup.update_button') }}
            </button>
        </form>

    </div>
    <el-button @click="showConfirmDialog">
    {{ $t('navigation.delete_account') }}
  </el-button>
    <notifications position="bottom right" />
</template>

<script setup>
import axios from "axios";
import { ref, watch, computed, onMounted } from "vue";
import { useRouter, useRoute, onBeforeRouteUpdate } from "vue-router";
import url from "@/utils/url";
import { useNavbarStore } from "@/stores/navbar";
import { useNotification } from "@kyvg/vue3-notification";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import { ElMessageBox } from 'element-plus';
import SlashedEyeIcon from "./icons/SlashedEyeIcon.vue";
import EyeIcon from "./icons/EyeIcon.vue";


const router = useRouter();
const form = ref({
    pseudo: "",
    avatar: "",
    password: "",
    confirmPassword: ""
});
const passwordType = ref('invisible');
const confirmPasswordType = ref('invisible');
const avatarInput = ref(null);
const avatarPreviewUrl = ref(null);
const authStore = useAuthStore();
const isConfirmedDelete = ref(false);
const isDialogVisible = ref(false);
const user = ref(null);
const navbarStore = useNavbarStore();
const { notify } = useNotification();
const route = useRoute();
const { t } = useI18n()


const updateAvatar = async (event) => {
    if(user.value?.pseudo !== authStore.user?.pseudo) {
        return
    }
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const response = await axios.put(
                `${url.baseUrl}/api/v1/users/${authStore.user?.id}`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${authStore.token}`,
                    },
                }
            );

            user.value.avatar = response.data.updatedUser.avatar;
            user.value = { ...user.value };
            notify({
                title: t('notification.title.update_user'),
                type: 'success',
                text: response.data.message,
            });

        } catch (error) {
            notify({
                title: t('notification.title.update_user'),
                type: 'error',
                text: error.response.data.message,
            });
        }
    }
}

const showConfirmDialog = () => {
  ElMessageBox.confirm(
    t('profile.delete_warning') + t('profile.delete_answer'),
    t('profile.delete_title'),

    {
      confirmButtonText: t('navigation.yes'),
      cancelButtonText: t('navigation.no'),
      type: 'warning',
      center: true,
    }
  )
    .then(() => {
      confirmDelete()
    })
    .catch(() => {
      // annulé
    })
}

const confirmDelete = () => {
    isConfirmedDelete.value = true;
    isDialogVisible.value = false;
    deleteAccount();
    authStore.logout();
    router.push(`/articles`);
};

const changeType = (field) => {
    if (field === "password") {
        passwordType.value = passwordType.value === "visible" ? "invisible" : "visible";
    }
    if (field === "confirmPassword") {
        confirmPasswordType.value = confirmPasswordType.value === "visible" ? "invisible" : "visible";
    }
};

watch(avatarPreviewUrl, (newUrl, oldUrl) => {
    if (oldUrl) {
        URL.revokeObjectURL(oldUrl);
    }
});


const isFormInvalid = computed(() => {
    return (
        form.value.password !== form.value.confirmPassword ||
        !form.value.password ||
        !form.value.confirmPassword ||
        !form.value.pseudo
    );
});


const handleSubmit = async () => {
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
        formData.append("password", form.value.password);

        const response = await axios.put(`${url.baseUrl}/api/v1/users/${authStore.user.id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${authStore.token}`,
            },
            withCredentials: true
        });

        notify({
            title: t('notification.title.update_user'),
            type: 'success',
            text: response.data.message,
        });

    } catch (error) {
        notify({
            title: t('notification.title.update_user'),
            type: 'error',
            text: error.response?.data?.message || 'Update failed.',
        });
    }
};

const fetchUser = async (pseudo) => {
    axios.get(`${url.baseUrl}/api/v1/users/${pseudo}`)
        .then((response) => {
            form.value = {
                pseudo: response.data.user.pseudo,
            };
            user.value = response.data.user;
        })
        .catch((error) => {
            console.error('Failed to load user', err);
        })
}

const selectAvatar = () => {
    avatarInput.value.click();
}

onBeforeRouteUpdate((to, from, next) => {
    if (to.params.pseudo !== from.params.pseudo) {
        fetchUser(to.params.pseudo);
    }
    next();
});

onMounted(() => {
    window.scrollTo(0, 0);
    navbarStore.closeMenu();
    fetchUser(route.params.pseudo)
});



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

const deleteAccount = async () => {
    if (isConfirmedDelete) {
        try {
            await axios.delete(`${url.baseUrl}/api/v1/users/${authStore.user.id}`, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${authStore.token}`,
            },
            withCredentials: true
        })
        } catch (error) {
            console.log("error: ", error)
        }
        authStore.logout()
        router.push(`/articles`);
    }
};
</script>

<style scoped>
.signup-container {
    max-width: 500px;
}

.file-upload {
    position: relative;
    display: inline-block;
}

.error-border {
    border: 2px solid #ff4d4d;
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

.el-button {
    border-color: #ff4d4d;
    color: red;
}

.el-button:hover {
    background-color: #ff4d4d77;
    border-color: #ff4d4d;
    color: red;
}

.clickable {
    cursor: pointer;
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

.password-icon {
  position: absolute;
  right: 10px;
  top: 18px;
  cursor: pointer;
  font-size: 20px;
  color: #333;
}
</style>