<template>
  <div class="container">
    <div v-if="state === 'error'">
      <p>Impossible de charger les articles</p>
    </div>
    <div class="aria-busy-container" :aria-busy="state === 'loading'">
      <div v-for="(article, index) in articles" :key="index">
        <VideoArticle v-if="article.urlYoutube" :article="article" />
        <PreviewArticle v-if="article.preview" :article="article" />
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import url from "../utils/url";
import VideoArticle from "./VideoArticle.vue";
import PreviewArticle from "./PreviewArticle.vue";

const articles = ref(null);
const state = ref("loading");

onMounted(() => {
  axios(`${url.baseUrl}:${url.portBack}/api/v1/articles`, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((response) => {
      articles.value = response.data.articles;
      state.value = "idle";
    })
    .catch((error) => {
      console.log("error : ", error);
      state.value = "error";
    });
});
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}
.aria-busy-container {
  width: 100%;
  text-align: center;
  max-width: 1000px; 
  margin: 0 auto;
}
</style>