<template>
    <div class="roadmap pico">
      <h1>Project Roadmap</h1>
  
      <ul class="status-list">
        <li>
          CORE v1 — Terminé
          <i class="fas fa-check-circle" style="color: green;"></i>
        </li>
        <li>
          CORE v2 — En cours
          <i class="fas fa-tools" style="color: orange;"></i>
        </li>
        <li>
          CORE v3 — À venir
          <i class="fas fa-hourglass-half" style="color: gray;"></i>
        </li>
      </ul>
  
      <section class="releases-notes">
        <h2>Last releases</h2>
        <p><strong>v2.1.1</strong></p>
        <ul class="standard-list">
          <li>Add update article (in profile view).</li>
          <li>Isolate the upload folder and make it persistent.</li>
          <li>Add Roadmap.</li>
        </ul>
        <p><strong>v2.0.1</strong></p>
        <ul class="standard-list">
          <li>Fix multiples bugs.</li>
        </ul>
      </section>
  
      <section class="core-details">
        <h2>CORE v1</h2>
        <ul class="standard-list">
          <li>A form allows users to feed the list of articles.</li>
          <li>Users can comment on articles, like and associate tags.</li>
          <li>Admin users can validate articles and associated tags.</li>
          <li>Sort and filter articles by date, tags, pertinence.</li>
          <li>Implement article reporting, gamification, i18n, infinite loading.</li>
        </ul>
  
        <h2>CORE v2</h2>
        <ul class="standard-list">
          <li>Buy domain & deploy on server.</li>
          <li>Dockerize project.</li>
          <li>Video upload & streaming with HLS.</li>
          <li>File storage optimization.</li>
          <li>Style improvement (Element+).</li>
          <li>CI/CD pipeline with Docker.</li>
        </ul>
  
        <h2>CORE v3</h2>
        <ul class="standard-list">
          <li>SSR for SEO.</li>
          <li>Accessibility features.</li>
          <li>Security enhancements.</li>
          <li>Performance: cache, CDN.</li>
          <li>Abuse reporting improvements.</li>
        </ul>
      </section>
    </div>
  </template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  window.scrollTo(0, 0); 
});
</script>
  
  <style scoped>
  .roadmap {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    font-size: 18px;
    color: #fff;
  }
  
  h1,
  h2 {
    color: #4f1a81; /* Violet clair */
    margin: 1.5rem 0 1rem;
  }
  
  /* Liste sans puce (status avec icônes) */
  .status-list {
    list-style: none;
    padding: 0;
  }
  
  .status-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0.5rem 0;
    padding: 0.5rem 1rem;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
  }
  
  /* Listes avec puces */
  .standard-list {
    list-style: lower-alpha;
    padding-left: 1.5rem;
  }
  
  .standard-list li {
    margin: 0.5rem 0;
  }
  
  /* Section releases */
  .releases-notes {
    margin-top: 2rem;
    background-color: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    border-radius: 8px;
  }
  
  .core-details {
    margin-top: 2rem;
  }
  
  .core-details h2 {
    margin-top: 1.5rem;
    font-size: 1.2rem;
    color: #863ec9;
  }
  </style>
  