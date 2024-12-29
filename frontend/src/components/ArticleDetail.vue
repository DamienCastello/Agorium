<template>
  <div class="container">
    <div v-if="state === 'error'">
      <p>Impossible de charger cet article</p>
    </div>
    <div v-else-if="state === 'loading'">
      <p>Chargement de l'article...</p>
    </div>
    <div v-else class="article-container">
      <div class="tags-badges">
        <p v-for="tag in article.tags" :key="tag.id" class="badge">{{ tag.name }}</p>
      </div>

      <h1>{{ article.title }}</h1>
      <div v-if="article.urlYoutube">
        <Player :videoId="extractYoutubeUrl(article.urlYoutube)" />
      </div>
      <div v-else-if="article.preview">
        <img :src="`${url.baseUrl}:${url.portBack}/${article.preview}`" alt="Preview" />
      </div>
      <div class="content">
        <p>{{ article.description }}</p>

        <FadeSlideTransition>
          <component :is="componentToShow" @click="toggleLike" />
        </FadeSlideTransition>
      </div>
      <hr />
      <Comments :article="article" :refreshComments="fetchArticle" />
    </div>
  </div>
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
import LikedIcon from "./icons/likedIcon.vue";
import UnlikedIcon from "./icons/unlikedIcon.vue";
import Comments from "./Comments.vue";

const article = ref(null);
const isLiked = ref(false);
const state = ref("loading");
const route = useRoute();
const authStore = useAuthStore();

const toggleLike = () => {
  if (!article.value || !article.value.id) {
    console.error("Article is not loaded or missing ID");
    return;
  }

  axios
    .post(`${url.baseUrl}:${url.portBack}/api/v1/articles/${article.value.id}/like`, {}, {
      withCredentials: true,
      headers: {
        "Authorization": `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      article.value.likes = response.data.likes;
      console.log("check likes after: ", article.value.likes, response.data.likes)
      state.value = "idle";
      isLiked.value = response.data.isLiked;
    })
    .catch((error) => {
      console.error("Error on liking or unliking article:", error);
      state.value = "error";
    });
};

const fetchArticle = () => {
  axios(`${url.baseUrl}:${url.portBack}/api/v1/articles/${route.params.id}`, {
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
      console.error("Error fetching article:", error.message);
      state.value = "error";
    });
};

// Dynamically select component
const componentToShow = computed(() => {
  return isLiked.value ? LikedIcon : UnlikedIcon;
});

onMounted(() => {
  const articleId = route.params.id;
  
  if (!articleId) {
    state.value = "error";
    return;
  }

  axios(`${url.baseUrl}:${url.portBack}/api/v1/articles/${articleId}`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((response) => {
      if (response.data && response.data.article) {
        article.value = response.data.article;
        //Set isLiked to dynamic display icon
        if(!authStore.user) {
          isLiked.value = false
          state.value = "idle";
        } else {
          for(let i=0; i<response.data.article.likes.length; i++){
            if(response.data.article.likes[i].user.id === authStore.user.id){
              isLiked.value = true
              state.value = "idle";
            }
          }
        }
        state.value = "idle";
      } else {
        state.value = "error";
      }
    })
    .catch((error) => {
      console.log("Error fetching article:", error.message);
      state.value = "error";
    });
});
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

@media (max-width: 768px) {
  .article-container {
    max-width: 400px;
    min-width: 400px;
  }
  h1 {
    font-size: 20px;
  }
}

p {
  margin-top: 15px;
  text-align: center;
}

span {
  font-weight: bold;
}

.tags-badges {
  margin-bottom: 8px;
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.badge {
  background-color: rgb(64, 64, 191);
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 15px;
}

.content p {
  margin: 0 auto;
  text-align: center;
  font-size: 16px;
}

.icon {
  cursor: pointer;
  font-size: 50px;
  margin-left: 10px;
}
</style>
