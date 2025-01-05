<template>
  <div class="player-container" 
      @click="closeNavbar"
      :class="{ 'navbar-open': navbarStore.isMenuOpen }">
    <iframe
      class="player"
      :src="`https://www.youtube.com/embed/${videoId}`"
      frameborder="0"
      allowfullscreen
    />
  </div>

  </template>
  
  <script setup>
  import { useNavbarStore } from '../stores/navbar';
  const { videoId } = defineProps({
    videoId: String
  })

  const navbarStore = useNavbarStore();

  const closeNavbar = () => {
  console.log("enter");
  if (navbarStore.isMenuOpen) {
    navbarStore.closeMenu();
  }
};
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

.player-container.navbar-open .player {
  pointer-events: none;
}
</style>