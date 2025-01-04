<template>
  <div class="player-container">
    <iframe
      class="player"
      :src="`https://www.youtube.com/embed/${videoId}`"
      frameborder="0"
      allowfullscreen
    />
  </div>

  </template>
  
  <script setup>
  const { videoId } = defineProps({
    videoId: String
  })
  </script>

<style scoped>
.player-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  height: 100% !important;
  overflow: hidden;
  background-color: #000;
  border-radius: 8px;
}

.player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}
</style>