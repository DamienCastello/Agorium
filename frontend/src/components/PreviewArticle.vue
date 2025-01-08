<template>
    <div class="pico">
        <h1>{{ props.article.title }}</h1>
        <img :src="`${url.baseUrl}:${url.portBack}/${props.article.preview}`" :alt="'preview-' + props.article.title"
            style="max-width: 300px; max-height: 300px">
        <p>{{ props.article.description }}</p>
        <hr />
    </div>
</template>

<script setup>
import url from '@/utils/url';

const props = defineProps(['article'])
</script>