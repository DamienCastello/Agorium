<template>
    <p><span>{{ props.comment.user.name }}:</span> {{ props.comment.content }}</p>
    <div class="actions">
        <div class="action-like" @click="toggleLike">
            {{ likeNumber }} <FadeSlideTransition>
                <component :is="componentToShow" />
            </FadeSlideTransition>
        </div>
        <div class="action-report" @click="navigateToReport(props.comment.id)">
            <ReportIcon class="icon"/>
            Signaler le commentaire
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

const props = defineProps({
    comment: Object,
});

const { handleNavbar } = useNavbarHandler();
const isLiked = ref(false);
const authStore = useAuthStore();
const likeNumber = ref(0);
const { notify } = useNotification();
const router = useRouter();

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
                title: "Liking Comment",
                type: 'error',
                text: "Comment is not loaded or missing ID !",
            });
            return;
        }

        if (!authStore.user) {
            notify({
                title: "Liking Comment",
                type: 'error',
                text: "You must be authenticated to like a comment.",
            });
            return;
        }

        axios
            .post(`${url.baseUrl}:${url.portBack}/api/v1/comments/${props.comment.id}/like`, {commentId: props.comment.id, userId: authStore.user.id}, {
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
                    title: "Liking Comment",
                    type: 'error',
                    text: error.response.data.message,
                });
            });
    })
};

const navigateToReport = (id) => {
    handleNavbar(() => {
        router.push({ 
            name: 'ReportComment', 
            params: { commentId: id, entity: 'comments', media: 'none' } 
        });
    });
};
</script>

<style>
span {
    font-weight: bold;
    margin-right: 8px;
}

@media (max-width: 768px) {
    span {
        margin-right: 4px;
    }
}
</style>