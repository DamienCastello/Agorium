<template>
    <div class="container pico">
      <div v-if="state === 'error'">
        <p>{{ $t('articles.state_error') }}</p>
      </div>
      <div v-else class="articles-grid" :aria-busy="state === 'loading'">
        <div
          v-for="(article, index) in articles"
          :key="index"
          class="card"
          @click="navigateToValidation(article.id)"
        >
          <img
            v-if="article.urlYoutube"
            :src="getYoutubeThumbnail(article.urlYoutube)"
            alt="Preview"
            class="card-image"
          />
          <img
            v-else-if="article.preview"
            :src="`${url.baseUrl}/${article.preview}`"
            alt="Preview"
            class="card-image"
          />
  
          <div class="card-content">
            <h2>{{ article.title }}</h2>
            <p class="description">
              {{
                article.description.length > 200
                  ? article.description.slice(0, 200) + "..."
                  : article.description
              }}
            </p>
            <div class="badge-container">
              <p :class="{'valid-badge': tag.isValid, 'invalid-badge': !tag.isValid}" v-for="(tag, index) in article.tags" :key="index">
                {{ tag.name }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <notifications position="bottom right" />
  </template>
  
  
  <script setup>
 import axios from "axios";
import { onMounted, ref, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import url from "../utils/url";
import getYoutubeThumbnail from "../utils/getYoutubeThumbnail";
import { useNavbarHandler } from "../composables/useNavbarHandler";
import { useNotification } from "@kyvg/vue3-notification";
import { useI18n } from "vue-i18n";

const articles = ref([]);
const state = ref("loading");
const isFetchingMore = ref(false);
const offset = ref(0);
const limit = 10;

const router = useRouter();
const { handleNavbar } = useNavbarHandler();
const { notify } = useNotification();
const { t } = useI18n();

const fetchArticles = async () => {
  if (isFetchingMore.value || state.value === "error") return;

  isFetchingMore.value = true;
  try {
    const response = await axios.get(`${url.baseUrl}/api/v1/articles/invalid`, {
      params: { offset: offset.value, limit },
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const newArticles = response.data.articles;
    if (newArticles.length) {
      articles.value.push(...newArticles);
      offset.value += limit;
    }
    state.value = "idle";
  } catch (error) {
    notify({
      title: t("notification.title.validations_fetch"),
      type: "error",
      text: `Error fetching articles: ${error.response?.data?.message || error.message}`,
    });
    state.value = "error";
  } finally {
    isFetchingMore.value = false;
  }
};

const handleScroll = () => {
  const bottomReached =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;

  if (bottomReached) fetchArticles();
};

onMounted(() => {
  fetchArticles();
  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

const navigateToValidation = (id) => {
  handleNavbar(() => {
    router.push(`/validations/${id}`);
  });
};
  </script>
  
  <style>
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px;
  }
  
  .articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }
  
  .card {
    cursor: pointer;
    background-color: rgb(233, 233, 233);
    border: 1px solid rgb(233, 233, 233);
    border-radius: 10px;
    overflow: hidden;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .card:hover {
    transform: scale(1.05);
  }
  
  .card-image {
    width: 100%;
    height: 200px;
    object-fit: contain;
    display: block;
  }
  
  .card-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-grow: 1;
  }
  
  .card-content h2 {
    font-size: 18px;
    margin: 0 0 8px 0;
  }
  
  .description {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
    min-height: 60px;
  }
  
  .badge-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    margin-top: auto;
  }
  
  .valid-badge {
    background-color: rgb(64, 64, 191);
    color: #ffffff !important;
    font-size: 12px !important;
    padding: 4px 8px;
    border-radius: 12px;
    display: inline-block;
    margin: 0px 3px !important;
  }

  .invalid-badge {
    background-color: #e4a100;
    color: #ffffff !important;
    font-size: 12px !important;
    padding: 4px 8px;
    border-radius: 12px;
    display: inline-block;
    margin: 0px 3px !important;
  }
  </style>
  