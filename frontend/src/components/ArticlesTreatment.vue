
  <template>
    <h1>{{ $t('profile.label_articles_treatment') }}</h1>
  <div
  ref="scrollRef"
  class="scroll-container pico"
  v-infinite-scroll="loadMore"
  :infinite-scroll-disabled="isFetching || state === 'end'"
  :infinite-scroll-delay="300"
  >
    <div class="article-card" v-for="(article, index) in articles" :key="index" @click="navigateToArticle(article.id)">
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
      <img
        v-else-if="article.video"
        :src="`${url.baseUrl}/${article.thumbnail}`"
        alt="Preview"
        class="card-image"
      />
      <div class="card-content">
        <h3>{{ article.title }}</h3>
        <p class="description">
          {{
            article.description.length > 100
              ? article.description.slice(0, 100) + "..."
              : article.description
          }}
        </p>
        <div class="badge-container">
          <span class="badge" v-for="(tag, index) in article.tags" :key="index">
            {{ tag.name }}
          </span>
        </div>
      </div>
    </div>
    <p v-if="articles.length === 0">{{ $t('articles.empty_list') }}</p>
  </div>
</template>


  

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import url from '@/utils/url';
import { useRouter } from 'vue-router';
import { useNotification } from '@kyvg/vue3-notification';
import { useAuthStore } from '@/stores/auth';
import getYoutubeThumbnail from '@/utils/getYoutubeThumbnail';
import { useI18n } from 'vue-i18n';
import { ElInfiniteScroll } from 'element-plus'


const articles = ref([]);
const state = ref('loading');
const offset = ref(0);
const limit = ref(10);
const isFetching = ref(false);
const scrollRef = ref(null);
const router = useRouter();
const { notify } = useNotification();
const authStore = useAuthStore();
const { t } = useI18n();

defineExpose({ ElInfiniteScroll })

const loadMore = () => {
  if (!isFetching.value && state.value !== "end") {
    fetchArticles();
  }
};

const fetchArticles = async () => {
  if (isFetching.value || state.value === 'end') return;

  isFetching.value = true;

  try {
    const res = await axios.get(`${url.baseUrl}/api/v1/articles/invalid/user/${authStore.user.id}`, {
      params: { limit: limit.value, offset: offset.value },
      withCredentials: true,
    });

    if (res.data.articles.length > 0) {
      articles.value.push(...res.data.articles);
      offset.value += limit.value;
    } else {
      state.value = 'end';
    }
  } catch (error) {
    notify({
      title: t('notification.title.articles_fetch'),
      type: 'error',
      text: error.response?.data?.message || 'Erreur de chargement',
    });
    state.value = 'error';
  } finally {
    isFetching.value = false;
  }
};

const navigateToArticle = (id) => {
  router.push(`/articles/edit/${id}`);
};

onMounted(() => {
  fetchArticles();

  const el = scrollRef.value;
  if (!el) return;

  // Molette : scroll horizontal
  el.addEventListener("wheel", (e) => {
    if (e.deltaY !== 0) {
      e.preventDefault();
      const ratio = el.scrollWidth / (el.clientWidth / 2);
      const boost = Math.min(12, Math.max(3, ratio));
      el.scrollLeft += e.deltaY * boost;
    }
  }, { passive: false });

  // Scroll horizontal = fetch à la fin
  el.addEventListener("scroll", () => {
    const reachedEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
    if (reachedEnd && !isFetching.value && state.value !== "end") {
      loadMore();
    }
  });
});

</script>

<style scoped>
.scroll-container {
  width: 90%;
  margin: 0 auto;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  flex-wrap: nowrap;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #4040BF10;
  border-radius: 12px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: grab;
  scroll-behavior: smooth;
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

.article-card {
  flex: 0 0 auto;
  width: clamp(120px, 25vw, 180px);
  background: white;
  border: 1px solid #ccc;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.article-card:hover {
  transform: scale(1.02);
}

.card-image {
  width: 100%;
  height: clamp(30px, 15vw, 100px);
  object-fit: cover;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.card-content {
  padding: 0.6rem;
}

.card-content h3 {
  font-size: clamp(0.4rem, 2vw, 0.5rem) !important;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description {
  font-size: clamp(0.4rem, 1.5vw, 0.5rem);
  color: #555;
  margin: 0.5rem 0;
  height: clamp(1.5rem, 2.5vw, 2.4rem);
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.badge {
  background-color: #4040BF;
  color: white;
  padding: 2px 2px;
  border-radius: 999px;
  font-size: clamp(7px, 1.3vw, 9px) !important;
}

/* Orientation landscape: réduire un peu les tailles */
@media (max-width: 600px) and (orientation: landscape) {
  .scroll-container {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .card-content {
    padding: 0.4rem;
  }
}
</style>

