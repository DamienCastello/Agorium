<template>
  <div class="container">
    <div class="filter-sort-container">
      <!-- Barre de filtres et tri -->
      <div class="filters-sort-row">
        <div class="filters">
          <!-- Filtre par tags -->
          <div class="tag-filter">
            <div class="label-filter">
              <TagIcon />
              <label for="tagFilter">{{ $t('articles.tag_filter') }} :</label>
            </div>
            <div class="pico">
              <select id="tagFilter" v-model="selectedTag" @change="fetchArticles(true)" class="tag-selector">
                <option value="">{{ $t('articles.all_tags') }}</option>
                <option v-for="tag in allTags" :key="tag.id" :value="tag.name">
                  {{ tag.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Tri par date (par défaut) ou par likes -->
          <div class="sort-filter">
            <div class="label-filter">
              <SortIcon />
              <label class="pico">{{ $t('articles.sort_by') }} :</label>
            </div>
            <div class="pico">
              <select v-model="sortBy" @change="fetchArticles(true)" class="sort-selector">
                <option value="createdAt">{{ $t('articles.sort_near') }}</option>
                <option value="likes">{{ $t('articles.sort_likes') }}</option>
              </select>
            </div>
          </div>

        </div>

        <!-- Filtre par intervalle de dates -->
        <div class="filter date-filter">
          <label>{{ $t('articles.date_filter') }} :</label>
          <VueDatePicker v-model="dateRange" :format="formatDateRange" :placeholder="$t('articles.date_placeholder')"
            range is-range @update:model-value="fetchArticles(true)" :input-class="'custom-datepicker-input'"
            :enable-time-picker="false" :disable-time="true" />
        </div>
      </div>

      <!-- Barre de recherche -->
      <div class="search-row">
        <!-- Filtre par nom -->
        <div>
          <div class="label-filter">
            <SearchIcon />
            <label for="nameFilter">{{ $t('articles.name_filter') }} :</label>
          </div>
          <div class="pico">
            <input type="text" id="nameFilter" v-model="nameFilter" @input="fetchArticles(true)"
              :placeholder='$t("articles.name_placeholder")' />
          </div>
        </div>
      </div>
    </div>

    <!-- Grille des articles -->
    <div v-if="state === 'error'">
      <p>{{ $t('articles.state_error') }}</p>
    </div>
    <div v-else class="articles-grid pico" :aria-busy="state === 'loading'">
      <div v-for="(article, index) in articles" :key="index" class="card"
        @click="navigateToArticle(article.id)">
        <img v-if="article.urlYoutube" :src="getYoutubeThumbnail(article.urlYoutube)" alt="Preview"
          class="card-image" />
        <img v-else-if="article.preview" :src="`${url.baseUrl}/${article.preview}`" alt="Preview"
          class="card-image" />
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
            <p class="badge" v-for="(tag, index) in article.tags" :key="index">
              {{ tag.name }}
            </p>
          </div>
        </div>
      </div>
      <p v-if="articles.length === 0">{{ $t('articles.empty_list') }}</p>
    </div>
  </div>
  <notifications position="bottom right" />
</template>


<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import url from "../utils/url";
import getYoutubeThumbnail from "../utils/getYoutubeThumbnail";
import { useNotification } from "@kyvg/vue3-notification";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import TagIcon from "./icons/TagIcon.vue";
import SearchIcon from "./icons/SearchIcon.vue";
import SortIcon from "./icons/SortIcon.vue";
import { useI18n } from "vue-i18n";
import { format } from 'date-fns'

const articles = ref([]);
const state = ref("loading");
const selectedTag = ref("");
const nameFilter = ref("");
const dateRange = ref(null);
const sortBy = ref("createdAt");
const dateSort = ref("desc");
const router = useRouter();
const { notify } = useNotification();
const allTags = ref([]);
const { t } = useI18n();

const limit = ref(10);
const offset = ref(0);
const isFetching = ref(false);

// format in input date
function formatDateRange(dates) {
  if (Array.isArray(dates) && dates.length === 2 && dates[0] && dates[1]) {
    return `${format(dates[0], 'yyyy-MM-dd')} - ${format(dates[1], 'yyyy-MM-dd')}`
  }
  return ''
}

const fetchArticles = async (reset = false) => {
  if (isFetching.value) return;
  isFetching.value = true;

  if (reset) {
    articles.value = [];
    offset.value = 0;
    state.value = "loading";
  }

  try {
    const response = await axios.get(`${url.baseUrl}/api/v1/articles`, {
      params: {
        limit: limit.value,
        offset: offset.value,
        tag: selectedTag.value || null,
        search: nameFilter.value || null,
        dateFrom: dateRange.value?.[0] ? new Date(dateRange.value[0]).toLocaleDateString('fr-CA') : null,
        dateTo: dateRange.value?.[1] ? new Date(dateRange.value[1]).toLocaleDateString('fr-CA') : null,
        sortBy: sortBy.value,
        sortOrder: dateSort.value,
      },
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (response.data.articles.length > 0) {
      articles.value.push(...response.data.articles);
      offset.value += limit.value;
    } else {
      state.value = "end";
    }
  } catch (error) {
    notify({
      title: t('notification.title.articles_fetch'),
      type: "error",
      text: error.response?.data?.message || "Erreur de chargement",
    });
    state.value = "error";
  } finally {
    isFetching.value = false;
  }
};

// Détection du scroll
const handleScroll = () => {
  if (isFetching.value || state.value === "end") return;

  const bottomReached = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
  if (bottomReached) fetchArticles();
};

onMounted(() => {
  fetchArticles();
  axios.get(`${url.baseUrl}/api/v1/tags`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((response) => {
      allTags.value = response.data.tags
    })
    .catch((error) => {
      notify({
        title: t('notification.title.articles_fetch'),
        type: "error",
        text: error.response?.data?.message || "Erreur de chargement",
      });
      state.value = "error";
    })
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// Recharger les articles quand un filtre change
watch([selectedTag, nameFilter, dateRange, sortBy], () => {
  fetchArticles(true);
});

const navigateToArticle = (id) => {
  router.push(`/articles/${id}`);
};
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 800px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  cursor: pointer;
  max-width: 365px;
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

.badge {
  background-color: rgb(64, 64, 191);
  color: #ffffff !important;
  font-size: 12px !important;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
  margin: 3px 3px !important;
}

.filter-sort-container {
  width: 100%;
  max-width: 860px;
}

.filters-sort-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  height: 85px;
}

.date-filter {
  height: 85px;
  min-width: 280px;
  max-width: 300px;
  font-size: 16px;
}

.filters {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tag-filter {
  width: 100%;
  max-width: 220px;
  min-width: 200px;
}

.tag-selector {
  max-width: 220px;
  min-width: 200px;
  padding: 6px;
  font-size: 16px;
  height: 44px;
}

.sort-filter {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  min-width: 200px;
  max-width: 230px;
}

.sort-selector {
  max-width: 230px;
  min-width: 200px;
  padding: 6px;
  font-size: 16px;
  height: 44px;
}

.search-row {
  margin-top: 16px;
}

.filters>div {
  display: flex;
  flex-direction: column;
}

.label-filter {
  font-size: 16px;
  margin-bottom: 4px;
  color: #5e5e5e;
}

.dp-input {
  min-width: 350px !important;
}

.label-filter i {
  margin-right: 8px;
}

.filter label {
  margin-bottom: 4px;
}

.vue-datepicker {
  max-width: 200px;
}

/* Bordure autour du champ d'entrée */
.dp__theme_light {
  --dp-border-color-focus: #6400e4;
}

@media (max-width: 768px) {
  .filters-sort-row {
    height: 150px;
  }

  .tag-filter {
    width: 100%;
    max-width: 200px;
  }

  .tag-selector {
    max-width: 200px;
    padding: 2px;
    font-size: 14px;
  }

  .sort-filter {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    max-width: 160px;
  }

  .sort-selector {
    max-width: 160px;
    padding: 2px;
    font-size: 14px;
  }

  .filters>div {
    display: flex;
    flex-direction: column;
  }
}

@media (max-width: 660px) {
  .container {
    max-width: 400px;
  }
}

@media (max-width: 440px) {
  .tag-filter {
    min-width: 150px;
    max-width: 200px;
  }

  .tag-selector {
    min-width: 150px;
    max-width: 200px;
    font-size: 10px;
  }

  .sort-filter {
    min-width: 150px;
    max-width: 200px;
  }

  .sort-selector {
    min-width: 150px;
    max-width: 200px;
    font-size: 10px;
  }
}
</style>
