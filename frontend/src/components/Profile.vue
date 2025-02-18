<template>
    <div v-if="user" class="profile-container">
        <div class="avatar-container" @click="selectAvatar">
            <img :src="user.avatar ? `${url.baseUrl}:${url.portBack}/${user.avatar}` : `${url.baseUrl}:${url.portBack}/uploads/avatars/utilisateur.png`"
                :key="user.avatar" alt="user-avatar" class="avatar-image">
        </div>

        <input type="file" name="avatar" ref="avatarInput" @change="updateAvatar" style="display: none"
            accept="image/*" />

            <h1 class="title">
                {{ computedTitle }}
            </h1>
        <div class="achievements">
            <div v-for="(achievement, index) in user.achievements" :key="index" class="achievement">
                <BadgeCommentIcon :id="achievement.id" :icon="getIconClass(achievement.iconCategory)" />
            </div>
        </div>
    </div>

    <div v-else>
        <p>{{ $t('profile.state_loading') }}</p>
    </div>

    <notifications position="bottom right" />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import url from '@/utils/url';
import { useAuthStore } from '@/stores/auth';
import { useNotification } from "@kyvg/vue3-notification";
import BadgeCommentIcon from './icons/BadgeIcon.vue';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const { notify } = useNotification();
const user = ref(null);
const avatarInput = ref(null);
const { t, locale } = useI18n();

const getIconClass = (iconCategory) => {
    switch (iconCategory) {
        case 'comment':
            return 'fa-solid fa-comment';
        case 'article':
            return 'fa-solid fa-file';
        case 'celandar':
            return 'fa-solid fa-calendar';
        case 'star':
            return 'fa-solid fa-star';
        case 'flag':
            return 'fa-solid fa-flag'
    }
}

onMounted(() => {
    axios
        .get(`${url.baseUrl}:${url.portBack}/api/v1/users/${authStore.user?.id}`, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        })
        .then((response) => {
            user.value = response.data.user;
        })
        .catch((error) => {
            notify({
                title: t('notification.title.profile_error_user_fetch'),
                type: 'error',
                text: error.response.data.message,
            });
        });
});

const selectAvatar = () => {
    avatarInput.value.click();
}

const computedTitle = computed(() => {
  return locale.value === 'en'
    ? `${user.value?.name} ${t('profile.title')}`
    : `${t('profile.title')} ${user.value?.name}`;
});

const updateAvatar = async (event) => {
    const file = event.target.files[0];

    if (file) {
        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const response = await axios.put(
                `${url.baseUrl}:${url.portBack}/api/v1/users/${authStore.user?.id}`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            user.value.avatar = response.data.updatedUser.avatar;
            user.value = { ...user.value };


        } catch (error) {
            notify({
                title: t('notification.title.profile_error_avatar_update'),
                type: 'error',
                text: error.response.data.message,
            });
        }
    }
}
</script>

<style>
.profile-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.achievements {
    display: flex;
    flex-direction: row !important;
    align-items: center;
}

.achievement {
    margin: 10px 15px;
}

.avatar-container {
    cursor: pointer;
}

.avatar-image {
    border-radius: 50%;
    width: 200px;
    height: 200px;
    object-fit: cover;
    border: 2px solid #ccc;
}

input[type="file"] {
    display: none;
}
</style>
