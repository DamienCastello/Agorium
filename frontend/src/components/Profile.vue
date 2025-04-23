<template>
    <div v-if="user" class="profile-container">
        <div :class="{ clickable: user?.pseudo === authStore.user?.pseudo }"
            @click="user?.pseudo === authStore.user?.pseudo && selectAvatar()"
            >
            <img :src="user.avatar ? `${url.baseUrl}/${user.avatar}` : `${url.baseUrl}/uploads/avatars/utilisateur.png`"
                :key="user.avatar" alt="user-avatar" class="avatar-image">
        </div>

        <input type="file" name="avatar" ref="avatarInput" @change="updateAvatar" style="display: none"
            accept="image/*" />

            <h1 class="title">
                {{ computedTitle }}
            </h1>

            <h7>Points: {{ user?.points }}</h7>
            <h4>Succès: </h4>
        <div class="achievements pico">
            
            <div v-for="(achievement, index) in user.achievements" :key="index" class="achievement">
                <BadgeIcon :id="achievement.id" :icon="getIconClass(achievement.iconCategory)" />
            </div>
        </div>

            <ArticlesTreatment v-if="authStore.user?.id === user.id" />

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
import BadgeIcon from './icons/BadgeIcon.vue';
import ArticlesTreatment from './ArticlesTreatment.vue';
import { useI18n } from 'vue-i18n';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';

const authStore = useAuthStore();
const { notify } = useNotification();
const user = ref(null);
const avatarInput = ref(null);
const { t, locale } = useI18n();
const route = useRoute();

const fetchUser = async (pseudo) => {
  try {
    const { data } = await axios.get(`${url.baseUrl}/api/v1/users/${pseudo}`);
    user.value = data.user;
  } catch (err) {
    console.error('Failed to load user', err);
  }
};

onBeforeRouteUpdate((to, from, next) => {
  if (to.params.pseudo !== from.params.pseudo) {
    fetchUser(to.params.pseudo);
  }
  next();
});

onMounted(() => fetchUser(route.params.pseudo));


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
        case 'like':
            return 'fa-solid fa-heart'
    }
}

const selectAvatar = () => {
    avatarInput.value.click();
}

const computedTitle = computed(() => {
  return locale.value === 'en'
    ? `${user.value?.pseudo} ${t('profile.title')}`
    : `${t('profile.title')} ${user.value?.pseudo}`;
});

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
    width: 100%;
    max-width: 800px;
    overflow: hidden;
    box-sizing: border-box;
}

.avatar-image {
    border-radius: 50%;
    width: 200px;
    height: 200px;
    object-fit: cover;
    border: 2px solid #ccc;
    max-width: 100%;
    transition: width 0.3s, height 0.3s;
}

.achievements {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 20px;
}

.achievement {
    margin: 10px;
    text-align: center;
    transition: width 0.3s;
}

.clickable {
    cursor: pointer;
}

input[type="file"] {
    display: none;
}


</style>
