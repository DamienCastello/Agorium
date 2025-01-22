<template>
    <div class="comment-container">
        <div class="comment">
            <p><span>{{ props.comment.user.name }}:</span> {{ props.comment.content }}</p>
        </div>
        <div class="actions-comment">
            <div class="action-comment-like" @click="toggleLike">
                {{ likeNumber }} <FadeSlideTransition>
                    <component :is="componentToShow" />
                </FadeSlideTransition>
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
            .post(`${url.baseUrl}:${url.portBack}/api/v1/comments/${props.comment.id}/like`, { commentId: props.comment.id, userId: authStore.user.id }, {
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
    if (!authStore.user) {
      notify({
        title: t('notification.title.like_article'),
        type: 'error',
        text: t('notification.text.like_article_error_auth'),
      });
    return;
  }
  
    handleNavbar(() => {
        router.push({
            name: 'ReportComment',
            params: { commentId: id, entity: 'comments' }
        });
    });
};
</script>

<style>
span {
    font-weight: bold;
    margin-right: 8px;
}

.comment-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 0px;
    width: 90%;
}

.comment {
    min-width: 600px;
}

.actions-comment {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    margin-top: 0px;
    width: 100%;
}

.action-comment-report {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 70px;
    height: 70px;
    border: 2px solid rgb(70, 70, 70);
    border-radius: 10px;
    padding: 10px;
    background-color: #e7e7e7;
    cursor: pointer;
    margin: 5px 5px 0px 5px;
    font-size: 12px;
    text-align: center;
}

.action-comment-like {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 70px;
    height: 70px;
    font-size: 30px;
    border: 2px solid rgb(70, 70, 70);
    border-radius: 10px;
    padding: 10px;
    margin: 5px 5px 0px 5px;
    background-color: #e7e7e7;
    cursor: pointer;
}

@media (max-width: 768px) {
    span {
        margin-right: 4px;
    }

    .comment-container {
        flex-direction: column !important;
    }

    .comment {
        min-width: 200px;
    }

    .actions-comment {
        justify-content: center;
    }
}
</style>