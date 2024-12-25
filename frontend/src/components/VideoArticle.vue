<template>
    <h1>{{ props.article.title }}</h1>
    <Player :videoId="extractYoutubeUrl(props.article.urlYoutube)" />
    <p>{{ props.article.description }}</p>
    <hr />
</template>

<script setup>
import extractYoutubeUrl from "../utils/extractYoutubeUrl";
import Player from "./Player.vue";

const props = defineProps(['article'])
</script>