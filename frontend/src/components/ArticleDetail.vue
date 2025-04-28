<template>
  <div class="container pico">
    <div v-if="state === 'error'">
      <p>{{ $t('article_detail.state_error') }}</p>
    </div>
    <div v-else-if="state === 'loading'">
      <p>{{ $t('article_detail.state_loading') }}</p>
    </div>
    <div v-else class="article-container">
      <div class="tags-badges">
        <p v-for="tag in article.tags" :key="tag.id" class="badge">{{ tag.name }}</p>
      </div>

      <h1 class="title">{{ article.title }}</h1>
      <div v-if="article.urlYoutube">
        <Player :videoId="extractYoutubeUrl(article.urlYoutube)" />
      </div>
      <div v-else-if="article.video" class="player">
        <video controls :src="`${url.baseUrl}/${article.video}`" width="600">
          <source :src="`${url.baseUrl}/${article.video}`" type="video/mp4">
          Your browser does not support the video tag.
        </video>

      </div>
      <div v-else-if="article.preview">
        <img :src="`${url.baseUrl}/${article.preview}`" alt="Preview" />
      </div>
      <div class="action-container">
        <RouterLink :to="`/profile/${creator?.pseudo}`" class="author">
          <h3>{{ creator?.pseudo }}</h3>
          <img
            :src="creator?.avatar ? `${url.baseUrl}/${creator?.avatar}` : `${url.baseUrl}/uploads/avatars/utilisateur.png`"
            alt="author-avatar" class="author-avatar" />
        </RouterLink>
        <div class="action-like" @click="toggleLike">
          {{ likeNumber }} <FadeSlideTransition>
            <component :is="componentToShow" />
          </FadeSlideTransition>
        </div>
        <div class="action-report" @click="navigateToReport(article.id)">
          <ReportIcon class="icon" />
          {{ $t('article_detail.report') }}
        </div>
      </div>
      <p>{{ article.description }}</p>
      <hr />
      <div v-if="article.comments && article.comments.length > 0">
        <Comments :article="article" :refreshComments="fetchArticle" />
      </div>
    </div>
  </div>
  <notifications position="bottom right" />
</template>

<script setup>
import axios from "axios";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import extractYoutubeUrl from "../utils/extractYoutubeUrl";
import Player from "./Player.vue";
import FadeSlideTransition from "@/transitions/FadeSlideTransition.vue";
import url from "../utils/url";
import { useAuthStore } from "@/stores/auth";
import LikedIcon from "./icons/LikedIcon.vue";
import UnLikedIcon from "./icons/UnlikedIcon.vue";
import ReportIcon from "./icons/ReportIcon.vue";
import Comments from "./Comments.vue";
import { useNavbarHandler } from "@/composables/useNavbarHandler";
import { useNotification } from "@kyvg/vue3-notification";
import { useRouter } from "vue-router";
import { useGlobalStore } from '@/stores/global';

const article = ref(null);
const creator = ref(null);
const isLiked = ref(false);
const likeNumber = ref(0);
const state = ref("loading");
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const { handleNavbar } = useNavbarHandler();
const { notify } = useNotification();

const toggleLike = () => {
  handleNavbar(() => {
    if (!article.value || !article.value.id) {
      notify({
        title: "Liking Article",
        type: 'error',
        text: "Article is not loaded or missing ID !",
      });
      return;
    }

    if (!authStore.user) {
      notify({
        title: "Liking Article",
        type: 'error',
        text: "You must be authenticated to like an article.",
      });
      return;
    }

    axios
      .post(`${url.baseUrl}/api/v1/articles/${article.value.id}/like`, {}, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${authStore.token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        article.value.likes = response.data.likes;
        state.value = "idle";
        isLiked.value = response.data.isLiked;
        if (isLiked.value === true) likeNumber.value++
        else if (isLiked.value === false) likeNumber.value--
      })
      .catch((error) => {
        notify({
          title: "Liking Article",
          type: 'error',
          text: error.response.data.message,
        });
        state.value = "error";
      });
  })
};

const fetchArticle = () => {
  axios(`${url.baseUrl}/api/v1/articles/${route.params.id}`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((response) => {
      if (response.data && response.data.article) {
        article.value = response.data.article;
        state.value = "idle";
      } else {
        state.value = "error";
      }
    })
    .catch((error) => {
      notify({
        title: "Fetching Article",
        type: 'error',
        text: error.response.data.message,
      });
      state.value = "error";
    });
};

// Dynamically select component
const componentToShow = computed(() => {
  return isLiked.value ? LikedIcon : UnLikedIcon;
});

onMounted(() => {
  const articleId = route.params.id;

  if (!articleId) {
    state.value = "error";
    return;
  }

  axios(`${url.baseUrl}/api/v1/articles/${articleId}`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((response) => {
      if (response.data && response.data.article) {
        article.value = response.data.article;
        likeNumber.value = article.value.likes.length;
        //Set isLiked to dynamic display icon
        if (!authStore.user) {
          isLiked.value = false
          state.value = "idle";
        } else {
          for (let i = 0; i < response.data.article.likes.length; i++) {
            if (response.data.article.likes[i].user.id === authStore.user.id) {
              isLiked.value = true
              state.value = "idle";
            }
          }
        }

        //Fetch creator article
        axios.get(`${url.baseUrl}/api/v1/users/${response.data.article.userId}`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })
          .then((response) => {
            if (response.data && response.data.user) {
              creator.value = response.data.user
            }
          })
          .catch((error) => {
            notify({
              title: "Fetching User",
              type: 'error',
              text: error.response.data.message,
            });
            state.value = "error";
          });
        state.value = "idle";
      } else {
        state.value = "error";
      }
    })
    .catch((error) => {
      notify({
        title: "Fetching Article",
        type: 'error',
        text: error.response.data.message,
      });
      state.value = "error";
    });
});

const navigateToReport = (id) => {
  handleNavbar(() => {
    if (!authStore.user) {
      notify({
        title: "Liking Article",
        type: 'error',
        text: "You must be authenticated to report an article.",
      });
      return;
    }

    const articleType = article.value.urlYoutube ? 'youtube' : 'preview'
    globalStore.setReportType(articleType);
    router.push({
      name: 'ReportArticle',
      params: { articleId: id, entity: 'articles' }
    });
  });
};
</script>

<style>
.container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
  text-align: left;
  position: relative;
}

.article-container {
  width: 100%;
  min-width: 750px;
  margin: 0 auto;
}

p,
h1 {
  margin-top: 15px;
  text-align: center;
}

h3 {
  font-size: 20px !important;
  margin-bottom: 3px !important;
}

span {
  font-weight: bold;
}

.tags-badges {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
  max-width: fit-content;
}

.badge {
  background-color: rgb(64, 64, 191);
  color: #ffffff !important;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px !important;
  font-weight: 400;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.action-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  margin: 20px 10px;
}

.action-report {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px solid rgb(70, 70, 70);
  border-radius: 10px;
  padding: 10px;
  background-color: #e7e7e7;
  cursor: pointer;
}

.action-like {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 35px;
  border: 2px solid rgb(70, 70, 70);
  border-radius: 10px;
  padding: 10px;
  background-color: #e7e7e7;
  cursor: pointer;
}

.action-report:hover {
  background-color: #d1d1d1;
  transform: scale(1.05);
}

.action-like:hover {
  background-color: #d1d1d1;
  transform: scale(1.05);
}

.content p {
  margin: 0 auto;
  text-align: center;
  font-size: 16px;
  margin-top: 15px;
}

.icon {
  cursor: pointer;
  font-size: 50px;
}

.author {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100px;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;
}

.player {
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 768px) {
  .container {
    padding: 0px;
  }

  .article-container {
    max-width: 300px;
    min-width: 300px;
  }

  .action-report {
    margin-top: 5px;
  }

  h1 {
    font-size: 20px;
  }
}
</style>