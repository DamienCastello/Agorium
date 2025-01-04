<template>
  <div class="container">
    <div v-if="state === 'error'">
      <p>Impossible de charger les articles</p>
    </div>
    <div v-else class="articles-grid" :aria-busy="state === 'loading'">
      <div
        v-for="(article, index) in articles"
        :key="index"
        class="card"
        @click="navigateToArticle(article.id)"
      >
        <img
          v-if="article.urlYoutube"
          :src="getYoutubeThumbnail(article.urlYoutube)"
          alt="Preview"
          class="card-image"
        />
        <img
          v-else-if="article.preview"
          :src="`${url.baseUrl}:${url.portBack}/${article.preview}`"
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
            <p class="badge" v-for="(tag, index) in article.tags" :key="index">
              {{ tag.name }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import url from "../utils/url";
import getYoutubeThumbnail from "../utils/getYoutubeThumbnail";

const articles = ref([]);
const state = ref("loading");
const router = useRouter();

onMounted(() => {
  axios(`${url.baseUrl}:${url.portBack}/api/v1/articles`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((response) => {
      articles.value = [
      {
            "id": 1,
            "title": "Coup d’Etat OU élections : Comment RENVERSER les élites ? - Juan Branco",
            "description": "Enfin des mots sur les maux du système !",
            "preview": null,
            "urlYoutube": "https://www.youtube.com/watch?v=aHXTnmysFfw",
            "refusalReasons": "{\"title\":{\"value\":\"\",\"isValid\":true,\"validatedBy\":1},\"description\":{\"value\":\"\",\"isValid\":true,\"validatedBy\":1},\"urlYoutube\":{\"value\":\"\",\"isValid\":true,\"validatedBy\":1},\"preview\":{\"value\":\"\",\"isValid\":true,\"validatedBy\":1}}",
            "overallReasonForRefusal": "",
            "isValid": true,
            "validatedBy": 1,
            "createdAt": "2025-01-02T18:42:10.000Z",
            "updatedAt": "2025-01-02T18:42:10.000Z",
            "userId": 1,
            "likes": [
                {
                    "userId": 1,
                    "articleId": 1,
                    "createdAt": "2025-01-02T23:38:11.000Z",
                    "updatedAt": "2025-01-02T23:38:11.000Z",
                    "ArticleId": 1,
                    "user": {
                        "id": 1,
                        "name": "Gamma",
                        "email": "gamma@gmail.com"
                    }
                },
                {
                    "userId": 2,
                    "articleId": 1,
                    "createdAt": "2025-01-02T18:42:11.000Z",
                    "updatedAt": "2025-01-02T18:42:11.000Z",
                    "ArticleId": 1,
                    "user": {
                        "id": 2,
                        "name": "tsuk",
                        "email": "tsuk@gmail.com"
                    }
                }
            ],
            "tags": [
                {
                    "id": 1,
                    "name": "Politique",
                    "isValid": true,
                    "refusalReason": "",
                    "validatedBy": 1,
                    "createdAt": "2025-01-02T18:41:52.000Z",
                    "updatedAt": "2025-01-02T18:41:52.000Z",
                    "ArticleTag": {
                        "articleId": 1,
                        "tagId": 1,
                        "createdAt": "2025-01-02T18:42:11.000Z",
                        "updatedAt": "2025-01-02T18:42:11.000Z"
                    }
                },
                {
                    "id": 3,
                    "name": "Révolution",
                    "isValid": true,
                    "refusalReason": "",
                    "validatedBy": 1,
                    "createdAt": "2025-01-02T18:41:52.000Z",
                    "updatedAt": "2025-01-02T18:41:52.000Z",
                    "ArticleTag": {
                        "articleId": 1,
                        "tagId": 3,
                        "createdAt": "2025-01-02T18:42:11.000Z",
                        "updatedAt": "2025-01-02T18:42:11.000Z"
                    }
                }
            ],
            "comments": [
                {
                    "id": 2,
                    "content": "C'est un article vraiment intéressant, j'approuve!",
                    "userId": 2,
                    "articleId": 1,
                    "createdAt": "2025-01-02T18:42:28.000Z",
                    "updatedAt": "2025-01-02T18:42:28.000Z",
                    "user": {
                        "id": 2,
                        "name": "tsuk",
                        "email": "tsuk@gmail.com"
                    }
                },
                {
                    "id": 1,
                    "content": "On en a gros !",
                    "userId": 1,
                    "articleId": 1,
                    "createdAt": "2025-01-02T18:42:28.000Z",
                    "updatedAt": "2025-01-02T18:42:28.000Z",
                    "user": {
                        "id": 1,
                        "name": "Gamma",
                        "email": "gamma@gmail.com"
                    }
                }
            ]
        },
        {
            "id": 2,
            "title": "Pourquoi ne sommes nous pas en démocratie ?",
            "description": "Notre cause commune: Instituer nous-mêmes la puissance politique qui nous manque.",
            "preview": null,
            "urlYoutube": "https://www.youtube.com/watch?v=pNhjfgD0_m8",
            "refusalReasons": "{\"title\":{\"value\":\"\",\"isValid\":null,\"validatedBy\":null},\"description\":{\"value\":\"\",\"isValid\":null,\"validatedBy\":null},\"urlYoutube\":{\"value\":\"\",\"isValid\":null,\"validatedBy\":null},\"preview\":{\"value\":\"\",\"isValid\":null,\"validatedBy\":null}}",
            "overallReasonForRefusal": "",
            "isValid": null,
            "validatedBy": null,
            "createdAt": "2025-01-02T18:42:11.000Z",
            "updatedAt": "2025-01-02T18:42:11.000Z",
            "userId": null,
            "likes": [],
            "tags": [
                {
                    "id": 2,
                    "name": "Économie",
                    "isValid": true,
                    "refusalReason": "",
                    "validatedBy": 1,
                    "createdAt": "2025-01-02T18:41:52.000Z",
                    "updatedAt": "2025-01-02T18:41:52.000Z",
                    "ArticleTag": {
                        "articleId": 2,
                        "tagId": 2,
                        "createdAt": "2025-01-02T18:42:11.000Z",
                        "updatedAt": "2025-01-02T18:42:11.000Z"
                    }
                },
                {
                    "id": 5,
                    "name": "Système",
                    "isValid": true,
                    "refusalReason": "",
                    "validatedBy": 1,
                    "createdAt": "2025-01-02T18:41:52.000Z",
                    "updatedAt": "2025-01-02T18:41:52.000Z",
                    "ArticleTag": {
                        "articleId": 2,
                        "tagId": 5,
                        "createdAt": "2025-01-02T18:42:11.000Z",
                        "updatedAt": "2025-01-02T18:42:11.000Z"
                    }
                }
            ],
            "comments": [
                {
                    "id": 3,
                    "content": "Je suis d'accord, la démocratie a besoin d'un renouveau!",
                    "userId": 3,
                    "articleId": 2,
                    "createdAt": "2025-01-02T18:42:28.000Z",
                    "updatedAt": "2025-01-02T18:42:28.000Z",
                    "user": {
                        "id": 3,
                        "name": "Zanmato",
                        "email": "zanma@gmail.com"
                    }
                }
            ]
        },
      ]
      // articles.value = response.data.articles.filter((article) => article.isValid);
      state.value = "idle";
    })
    .catch((error) => {
      console.log("error : ", error);
      state.value = "error";
    });
});

const navigateToArticle = (id) => {
  router.push(`/articles/${id}`);
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
  object-fit:contain;
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
</style>
