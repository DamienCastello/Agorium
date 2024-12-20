<template>
    <fieldset>
      <label for="urlYoutube">URL Youtube <span style="color: red">*</span></label>
      <input
        id="urlYoutube"
        type="text"
        placeholder="https://www.youtube.com/watch?v=U3tqI9Sf5yU"
        v-model="youtubeUrl"
      />
    </fieldset>
  </template>
  
  <script setup>
  import { ref } from "vue";
  
  const youtubeUrl = ref("");
  </script>
  