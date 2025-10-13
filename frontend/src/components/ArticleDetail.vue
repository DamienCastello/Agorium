<template>
  <div class="container pico">
    <div v-if="state === 'error'">
      <p>{{ $t('article_detail.state_error') }}</p>
    </div>
    <div v-else-if="state === 'loading'">
      <p>{{ $t('article_detail.state_loading') }}</p>
    </div>
    <div v-else class="article-container">
      <div class="header-article">
        <div class="tags-badges">
          <p v-for="tag in article.tags" :key="tag.id" class="badge">{{ tag.name }}</p>
        </div>
        <div class="badge-process-container">
            <p v-if="article.processingStatus === 'queued'" class="queued-badge">
                <QueuedIcon /> {{ $t('validate.fileState_queued') }}
            </p>
            <p v-if="article.processingStatus === 'processing'" class="processing-badge">
                <ProcessingIcon /> {{ $t('validate.fileState_processing') }}
                <span v-if="Number.isFinite(article.processingProgress)"> - {{ article.processingProgress }}%</span>
            </p>
            <p v-if="article.processingStatus === 'failed'" class="failed-badge">
                <FailedIcon /> {{ $t('validate.fileState_failed') }}
            </p>
            <p v-if="article.processingStatus === 'ready' && !article.isValid" class="queued-badge">
                <QueuedIcon /> {{ $t('validate.fileState_validation') }}
            </p>
        </div>
        <div v-if="article.processingStatus === 'failed'" class="processing-actions">
            <button @click="retryProcessing" :disabled="loadingRetry || article.processingStatus === 'queued' || article.processingStatus === 'processing'">
                {{ loadingRetry ? 'Retry...' : 'Retry' }}
            </button>
        </div>
        <div v-if="article.isPrivate" class="private-icons">
          <LockIcon />
          <span>{{ $t('article_detail.private') }}</span>
        </div>
        <div v-if="!article.isPrivate" class="private-icons">
          <UnlockIcon />
          <span>{{ $t('article_detail.public') }}</span>
        </div>
      </div>


      <h1 class="title">{{ article.title }}</h1>
      <div v-if="article.urlYoutube">
        <Player :videoId="extractYoutubeUrl(article.urlYoutube)" />
      </div>
      <!-- HLS first, fallback MP4 handled inside the component -->
      <div v-else-if="article.hlsPlaylist" class="player">
        <HlsPlayer
          :hlsPlaylist="article.hlsPlaylist"
          :mp4Fallback="article.video || null"
          :poster="article.thumbnail || null"
          :width="600"
        />
      </div>

      <!-- If no HLS, keep MP4 path -->
      <div v-else-if="article.video" class="player">
        <video
          controls
          preload="metadata"
          :poster="article.thumbnail ? `${url.baseUrl}/${article.thumbnail}` : null"
          width="600"
          :src="`${url.baseUrl}/${article.video}`"
        >
          <source :src="`${url.baseUrl}/${article.video}`" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div v-else-if="article.preview" class="player">
        <img :src="`${url.baseUrl}/${article.preview}`" alt="Preview" />
      </div>
      <div class="action-container">
        <RouterLink :to="`/profile/${creator?.pseudo}`" class="author">
          <h3>{{ creator?.pseudo }}</h3>
          <img
            :src="creator?.avatar ? `${url.baseUrl}/${creator?.avatar}` : `${url.baseUrl}/uploads/avatars/utilisateur.png`"
            alt="author-avatar" class="author-avatar" />
        </RouterLink>  
        <div class="actions">
          <div v-if="authStore.user && authStore.user.id === article.userId" class="action-modify"
            @click="navigateToModify(article)">
            <PencilIcon class="icon" />
            {{ $t('article_detail.modify') }}
          </div>
          <div v-if="canShare" class="action-share"
            @click="copyLinkToClipboard(article)">
            <ShareIcon class="icon" />
            {{ $t('article_detail.share') }}
          </div>
          <div class="action-like" @click="toggleLike">
            <FadeSlideTransition>
              <component :is="componentToShow" />
            </FadeSlideTransition>
            {{ likeNumber }}
          </div>
          <div class="action-report" @click="navigateToReport(article.id)">
            <ReportIcon class="icon" />
            {{ $t('article_detail.report') }}
          </div>
        </div>
      </div>
      <p>{{ article.description }}</p>
      <hr />
      <Comments :article="article" :refreshComments="fetchArticle" />
    </div>
  </div>
  <notifications position="bottom right" />
</template>

<script setup>
import axios from "axios";
import { onMounted, ref, computed, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import extractYoutubeUrl from "../utils/extractYoutubeUrl";
import Player from "./Player.vue";
import FadeSlideTransition from "@/transitions/FadeSlideTransition.vue";
import { setOgBasic } from '../utils/meta'
import url from "../utils/url";
import { useAuthStore } from "@/stores/auth";
import LikedIcon from "./icons/LikedIcon.vue";
import UnLikedIcon from "./icons/UnlikedIcon.vue";
import ReportIcon from "./icons/ReportIcon.vue";
import PencilIcon from "./icons/PencilIcon.vue";
import ShareIcon from "./icons/ShareIcon.vue";
import Comments from "./Comments.vue";
import HlsPlayer from "@/components/HlsPlayer.vue";
import { useNavbarHandler } from "@/composables/useNavbarHandler";
import { useNotification } from "@kyvg/vue3-notification";
import { useRouter } from "vue-router";
import { useGlobalStore } from '@/stores/global';
import LockIcon from "./icons/LockIcon.vue";
import UnlockIcon from "./icons/UnlockIcon.vue";
import QueuedIcon from "./icons/QueuedIcon.vue";
import ProcessingIcon from "./icons/ProcessingIcon.vue";
import FailedIcon from "./icons/FailedIcon.vue";
import { useI18n } from "vue-i18n";

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
const privateLink = route.params.privateLink;
const articleId = route.params.id;
const { t } = useI18n();
const loadingRetry = ref(false)
let statusTimer = null
const isPollingStatus = ref(false)

async function reloadVideo() {
  const id = article.value?.id ?? route.params.id;
  if (!id) return;

  await axios.get(`${url.baseUrl}/api/v1/articles/${id}`, {
    headers: { Authorization: `Bearer ${authStore.token}`, 'Cache-Control': 'no-cache' },
  }).then((response) => {
    article.value.video = response.data.article.video;
  }).catch((error) => {
    console.log("error ", error)
  })
}

function startStatusPolling() {
  stopStatusPolling()
  isPollingStatus.value = true
  statusTimer = setInterval(async () => {
    try {
      const id = article.value?.id
      if (!id) return
      const { data } = await axios.get(`${url.baseUrl}/api/v1/articles/${id}/status`, {
        headers: { Authorization: `Bearer ${authStore.token}`, 'Cache-Control': 'no-cache' },
        params: { ts: Date.now() }
      })
      
      article.value.processingStatus = data.status
      article.value.processingProgress = data.progress ?? 0

      if (data.status === 'ready') {
        notify({ title: t('notification.title.article_process'), type: 'success', text: t('notification.text.article_process_ok') })
        await reloadVideo()
        stopStatusPolling()
      }
      if (data.status === 'failed') {
        notify({ title: t('notification.title.article_process'), type: 'success', text: t('notification.text.article_process_failed') })
        stopStatusPolling()
      }
    } catch (e) {
      console.warn('status poll error', e?.message || e)
    }
  }, 1500)
}

function stopStatusPolling() {
  isPollingStatus.value = false
  if (statusTimer) {
    clearInterval(statusTimer)
    statusTimer = null
  }
}

async function retryProcessing() {
  if (!article.value?.id) return
  loadingRetry.value = true
  try {
    await axios.post(
      `${url.baseUrl}/api/v1/articles/${article.value.id}/retry`,
      {},
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    )

    article.value.processingStatus = 'queued'
    article.value.processingProgress = 0

    startStatusPolling()

    notify({ title: t('notification.title.retry_process'), type: 'success', text: t('notification.text.retry_process') })
  } catch (e) {
    notify({
      title: 'Retry',
      type: 'error',
      text: e?.response?.data?.message || e?.message || 'Erreur lors du retry'
    })
  } finally {
    loadingRetry.value = false
  }
}

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
        title: t('notification.title.like_article'),
        type: 'info',
        text: t('notification.text.like_article_error_auth'),
      });
      return;
    }

    axios
      .post(`${url.baseUrl}/api/v1/articles/${article.value.id}/like`, {}, {
        withCredentials: true,
        headers: {
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

const fetchArticle = async () => {
  try {
    let response;
    if (privateLink) {
      response = await axios.get(`${url.baseUrl}/api/v1/articles/private/${route.params.privateLink}`);
    } else {
      response = await axios.get(`${url.baseUrl}/api/v1/articles/${route.params.id}`);
    }
    if (response.data && response.data.article) {
      article.value = response.data.article;
      state.value = "idle";
    } else {
      state.value = "error";
    }
  } catch (error) {
    notify({
      title: "Fetching Article",
      type: 'error',
      text: error.response.data.message,
    });
    state.value = "error";
  }
};

// Dynamically select component
const componentToShow = computed(() => {
  return isLiked.value ? LikedIcon : UnLikedIcon;
});

onMounted(async () => {
  window.scrollTo(0, 0);

  if (!articleId && !privateLink) {
    state.value = "error";
    return;
  }

  try {
    let response;
    if (privateLink) {
      response = await axios.get(`${url.baseUrl}/api/v1/articles/private/${route.params.privateLink}`);
    } else {
      response = await axios.get(`${url.baseUrl}/api/v1/articles/${route.params.id}`);
    }
    if (response.data && response.data.article) {
      if(response.data.article.processingStatus !== 'ready') startStatusPolling()
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

      const front = import.meta.env.VITE_FRONT_URL || window.location.origin
      const pageUrl = privateLink
        ? `${front}/articles/private/${route.params.privateLink}`
        : `${front}/articles/${article.value.id}`

      const apiPublic = url.baseUrl
      const ogImage =
        (article.value?.thumbnail && `${apiPublic}/${article.value.thumbnail}`) ||
        (article.value?.preview   && `${apiPublic}/${article.value.preview}`)   ||
        `${front}/og-banner.jpg`

      setOgBasic({
        title: article.value?.title || 'Agorium',
        description: article.value?.description || 'La plateforme de diffusion libre',
        image: ogImage,
        url: pageUrl
      })

      //Fetch creator to display info
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
  } catch (error) {
    notify({
      title: "Fetching Article",
      type: 'error',
      text: error.response.data.message,
    });
    state.value = "error";
  }
});

onBeforeUnmount(() => {
    stopStatusPolling()
});

const canShare = computed(() => {
  if (!article.value) return false
  if (!article.value.isPrivate) return true
  return !!(authStore.user && authStore.user.id === article.value.userId)
})

const navigateToReport = (id) => {
  handleNavbar(() => {
    if (!authStore.user) {
      notify({
        title: t('notification.title.report_article'),
        type: 'info',
        text: t('notification.text.report_article_error_auth'),
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

const navigateToModify = (article) => {
  handleNavbar(() => {
    if (article.isPrivate) {
      router.push({
        name: 'ArticlePrivateUpdate',
        params: { privateLink: article.privateLink }
      });
    } else {
      router.push(`/articles/edit/${article.id}`);
    }
  });
};

const copyLinkToClipboard = () => {
handleNavbar(() => {
  console.log("article : ", article.value)
  const link = article.value.isPrivate ? `${url.baseUrl}/api/v1/share/articles/private/${article.value.privateLink}` : `${url.baseUrl}/api/v1/share/articles/${article.value.id}`;
  navigator.clipboard.writeText(link)
    .then(() => {
      notify({
        title: t('notification.title.share_link'),
        type: 'success',
        text: t('notification.title.share_link_success'),
      });
    })
    .catch(() => {
      notify({
        title: t('notification.title.share_link'),
        type: 'error',
        text: t('notification.title.share_link_error'),
      });
    });
})
}
</script>

<style scoped>
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

.header-article {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.badge-process-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: auto;
  margin-bottom: 15px;
}

.queued-badge {
  background-color: rgb(112, 112, 112);
  color: #ffffff !important;
  font-size: 12px !important;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
  margin: 0px 3px !important;
  border: 1px solid black
}

.processing-badge {
  background-color: rgb(189, 192, 32);
  color: #ffffff !important;
  font-size: 12px !important;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
  margin: 0px 3px !important;
  border: 1px solid black
}

.failed-badge {
  background-color: rgb(189, 26, 26);
  color: #ffffff !important;
  font-size: 12px !important;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
  margin: 0px 3px !important;
  border: 1px solid black
}

.processing-actions {
    margin-bottom: 20px;
}

.action-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  margin: 20px 10px;
}

.actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.action-modify {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px solid rgb(70, 70, 70);
  border-radius: 10px;
  padding: clamp(4px, 2vw, 6px);
  background-color: #e7e7e7;
  cursor: pointer;
  width: clamp(70px, 10vw, 100px);
  height: clamp(90px, 10vw, 120px);
  margin-right: 10px;
}

.action-share {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px solid rgb(70, 70, 70);
  border-radius: 10px;
  padding: clamp(4px, 2vw, 6px);
  background-color: #e7e7e7;
  cursor: pointer;
  width: clamp(70px, 10vw, 100px);
  height: clamp(90px, 10vw, 120px);
  margin-right: 10px;
}

.action-like {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px solid rgb(70, 70, 70);
  border-radius: 10px;
  background-color: #e7e7e7;
  cursor: pointer;
  width: clamp(70px, 10vw, 100px);
  height: clamp(90px, 10vw, 120px);
  margin-right: 10px;
}

.action-report {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px solid rgb(70, 70, 70);
  border-radius: 10px;
  padding: clamp(4px, 2vw, 6px);
  background-color: #e7e7e7;
  cursor: pointer;
  width: clamp(70px, 10vw, 100px);
  height: clamp(90px, 10vw, 120px);
}

.action-modify:hover {
  background-color: #d1d1d1;
  transform: scale(1.05);
}

.action-share:hover {
  background-color: #d1d1d1;
  transform: scale(1.05);
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
  font-size: clamp(25px, 8vw, 40px);
}

.author {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100px;
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;
}

.player {
  display: flex;
  justify-content: center;
  align-items: center;
}

.private-icons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

@media (max-width: 768px) {
  .container {
    padding: 0px;
  }

  .article-container {
    min-width: clamp(300px, 10vw, 300px);
  }

  h1 {
    font-size: 20px;
  }

  .actions {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .action-like,
  .action-report,
  .action-modify,
  .action-share {
    font-size: clamp(10px, 2vw, 10px);
    padding: clamp(2px, 1.5vw, 5px);
  width: clamp(50px, 10vw, 90px);
  height: clamp(40px, 10vw, 50px);
    margin: 0;
  }

  .icon {
    font-size: clamp(16px, 1.5vw, 22px);
  }

  .action-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
  }

  .actions {
    background: none;
    max-width: none !important;
  }
}

</style>