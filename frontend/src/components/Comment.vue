<template>
    <div class="comment-container">
            <div class="comment">
                <RouterLink :to="`/profile/${props.comment.user?.pseudo}`" class="author">
                    <img :src="props.comment.user?.avatar ? `${url.baseUrl}/${props.comment.user?.avatar}` : `${url.baseUrl}/uploads/avatars/utilisateur.png`"
                        alt="author-avatar" class="author-avatar" />
                </RouterLink>
                <div class="comment-text">
                <p class="pseudo">{{ props.comment.user?.pseudo }}: </p>
                <span class="comment-content"> {{ props.comment?.content }}</span>
                </div>

            </div>

        <div class="actions-comment">
            <div class="action-comment-like" @click="toggleLike">
                <FadeSlideTransition>
                    <component :is="componentToShow" />
                </FadeSlideTransition>
                {{ likeNumber }}
            </div>
            <div class="action-comment-report" @click="navigateToReport(props.comment.id)">
                <ReportIcon class="icon" />
            </div>
        </div>
    </div>
    <notifications position="bottom right" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import url from '@/utils/url';
import FadeSlideTransition from '@/transitions/FadeSlideTransition.vue';
import { useNavbarHandler } from '@/composables/useNavbarHandler';
import FullThumbsUpIcon from './icons/FullThumbsUpIcon.vue';
import EmptyThumbsUpIcon from './icons/EmptyThumbsUpIcon.vue';
import ReportIcon from './icons/ReportIcon.vue';
import { useNotification } from "@kyvg/vue3-notification";
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    comment: Object,
});

const { handleNavbar } = useNavbarHandler();
const isLiked = ref(false);
const authStore = useAuthStore();
const likeNumber = ref(0);
const { notify } = useNotification();
const router = useRouter();
const { t } = useI18n();

// Dynamically select component
const componentToShow = computed(() => {
    return isLiked.value ? FullThumbsUpIcon : EmptyThumbsUpIcon;
});

onMounted(() => {
    likeNumber.value = props.comment.likes.length
})

const toggleLike = () => {
    handleNavbar(() => {
        if (!props.comment || !props.comment.id) {
            notify({
                title: t('notification.title.like_comment'),
                type: 'error',
                text: t('notification.text.like_comment_error_load'),
            });
            return;
        }

        if (!authStore.user) {
            notify({
                title: t('notification.title.like_comment'),
                type: 'error',
                text: t('notification.text.like_comment_error_auth'),
            });
            return;
        }

        axios
            .post(`${url.baseUrl}/api/v1/comments/${props.comment.id}/like`, { commentId: props.comment.id, userId: authStore.user.id }, {
                withCredentials: true,
                headers: {
                    "Authorization": `Bearer ${authStore.token}`,
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                isLiked.value = response.data.isLiked;
                if (isLiked.value === true) likeNumber.value++
                else if (isLiked.value === false) likeNumber.value--
            })
            .catch((error) => {
                notify({
                    title: t('notification.title.like_comment'),
                    type: 'error',
                    text: error.response.data.message,
                });
            });
    })
};

const navigateToReport = (id) => {
    handleNavbar(() => {
        if (!authStore.user) {
            notify({
                title: t('notification.title.report_comment'),
                type: 'error',
                text: t('notification.text.report_comment_error_auth'),
            });
            return;
        }


        router.push({
            name: 'ReportComment',
            params: { commentId: id, entity: 'comments' }
        });
    });
};
</script>

<style>
* { 
  box-sizing: border-box; 
}

.comment-container {
  display: flex;
  flex-direction: column; /* ↓ Les actions passent dessous */
  align-items: flex-start;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 0;
  width: 100%;
  max-width: 100%;
  padding: 6px 0;
}

.comment {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
}

.author {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 0 0 80px;
  min-width: 64px;
  max-width: 100px;
}

.author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;
  display: block;
}

.comment-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 auto;
  min-width: 0;
}

.pseudo {
  color: rgb(75, 75, 75);
  font-weight: bold;
  margin: 0;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.comment-content {
  font-weight: normal;
  color: rgb(75, 75, 75);
  word-break: break-word;
  overflow-wrap: anywhere;
  hyphens: auto;
  margin: 0;
  white-space: pre-wrap;
}

/* ✅ Actions sous le commentaire (même en desktop) */
.actions-comment {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
}

.action-comment-like,
.action-comment-report {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border: 2px solid rgb(70, 70, 70);
  border-radius: 10px;
  padding: 8px;
  background-color: #e7e7e7;
  cursor: pointer;
  text-align: center;
  box-sizing: border-box;
}

.action-comment-like {
  font-size: 24px;
}

.icon {
  font-size: 28px;
}

/* ✅ Responsive (reste pareil) */
@media (max-width: 768px) {
  .comment-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
  }

  .comment {
    width: 100%;
  }

  .author {
    flex: 0 0 auto;
    align-self: flex-start;
  }

  .author-avatar {
    width: 50px;
    height: 50px;
  }

  .actions-comment {
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
    gap: 10px;
    margin-top: 8px;
  }

  .action-comment-like,
  .action-comment-report {
    width: 56px;
    height: 56px;
    font-size: 20px;
  }

  .icon {
    font-size: 24px;
  }
}
</style>