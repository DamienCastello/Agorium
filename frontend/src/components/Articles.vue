<template>
  <div class="container">
    <div class="filter-sort-container">
      <!-- Barre de filtres -->
      <div class="filters">
        <!-- Filtre par tags -->
        <div class="filter pico">
          <label for="tagFilter">Filtrer par tags :</label>
          <select id="tagFilter" v-model="selectedTag" @change="applyFilters">
            <option value="">Tous les tags</option>
            <option v-for="tag in allTags" :key="tag.id" :value="tag.name">
              {{ tag.name }}
            </option>
          </select>
        </div>

        <!-- Filtre par nom -->
        <div class="filter pico">
          <label for="nameFilter">Filtrer par nom :</label>
          <input type="text" id="nameFilter" v-model="nameFilter" @input="applyFilters"
            placeholder="Rechercher par nom" />
        </div>

        <!-- Filtre par intervalle de dates -->
        <div class="filter">
          <label>Filtrer par intervalle de dates :</label>
          <VueDatePicker v-model="dateRange" :placeholder="'plage de dates'" range is-range
            @update:model-value="applyFilters" :input-class="'custom-datepicker-input'" />
        </div>
      </div>
      <!-- Tri par date -->
      <div class="sort pico">
        <label>Tri par date :</label>
        <select v-model="dateSort" @change="applyFilters">
          <option value="desc">Du plus récent au plus ancien</option>
          <option value="asc">Du plus ancien au plus récent</option>
        </select>
      </div>
    </div>




    <!-- Grille des articles -->
    <div v-if="state === 'error'">
      <p>Impossible de charger les articles</p>
    </div>
    <div v-else class="articles-grid pico" :aria-busy="state === 'loading'">
      <div v-for="(article, index) in filteredArticles" :key="index" class="card"
        @click="navigateToArticle(article.id)">
        <img v-if="article.urlYoutube" :src="getYoutubeThumbnail(article.urlYoutube)" alt="Preview"
          class="card-image" />
        <img v-else-if="article.preview" :src="`${url.baseUrl}:${url.portBack}/${article.preview}`" alt="Preview"
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
    </div>
  </div>
  <notifications position="bottom right" />
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import url from "../utils/url";
import getYoutubeThumbnail from "../utils/getYoutubeThumbnail";
import { useNavbarHandler } from "@/composables/useNavbarHandler";
import { useNotification } from "@kyvg/vue3-notification";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const articles = ref([]);
const filteredArticles = ref([]);
const state = ref("loading");
const selectedTag = ref("");
const nameFilter = ref("");
const dateRange = ref(null);
const dateSort = ref("desc");
const router = useRouter();
const { handleNavbar } = useNavbarHandler();
const { notify } = useNotification();
const allTags = ref([]);

onMounted(() => {
  axios(`${url.baseUrl}:${url.portBack}/api/v1/articles`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((response) => {
      // Charger uniquement les articles valides
      const validArticles = response.data.articles.filter(
        (article) => article.isValid
      );
      
      articles.value = validArticles;

      allTags.value = Array.from(
        new Set(validArticles.flatMap((article) => article.tags))
      );

      filteredArticles.value = validArticles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      state.value = "idle";
    })
    .catch((error) => {
      notify({
        title: "Fetching Articles",
        type: "error",
        text: error.response.data.message,
      });
      state.value = "error";
    });
});

const applyFilters = () => {
  // Filtrer par tag
  let filtered = articles.value;
  if (selectedTag.value) {
    filtered = filtered.filter((article) =>
      article.tags.some((tag) => tag.name === selectedTag.value)
    );
  }

  // Filtrer par nom
  if (nameFilter.value) {
    filtered = filtered.filter((article) =>
      article.title.toLowerCase().includes(nameFilter.value.toLowerCase())
    );
  }

  // Filtrer par intervalle de dates
  if(dateRange.value) {
    if (dateRange.value[0] || dateRange.value[1]) {
      const start = dateRange.value[0] ? new Date(dateRange.value[0]) : null;
      const end = dateRange.value[1] ? new Date(dateRange.value[1]) : null;
      console.log("start: ", start)
      console.log("end: ", end)
      filtered = filtered.filter((article) => {
        const articleDate = new Date(article.createdAt);
        return (
          (!start || articleDate >= start) && (!end || articleDate <= end)
        );
      });
    }
  }

  // Trier les articles par date selon la sélection
  if (dateSort.value === "desc") {
    filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    filtered = filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  filteredArticles.value = filtered;
};

const navigateToArticle = (id) => {
  handleNavbar(() => {
    router.push(`/articles/${id}`);
  });
};
</script>

<style scoped>
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
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
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
  margin: 0px 3px !important;
}

.filter-sort-container {
  width: 100%;
  max-width: 1200px;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

.filter label {
  margin-bottom: 4px;
}

vue-datepicker {
  max-width: 200px;
}

/* Bordure autour du champ d'entrée */
.dp__theme_light {
    --dp-border-color-focus: #6400e4;
}

</style>