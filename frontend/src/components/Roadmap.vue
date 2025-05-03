<template>
  <div class="roadmap">
    <h1>📌 Project Roadmap</h1>

    <section class="card">
      <h2>📝 Last Releases</h2>
      <div v-for="release in releases" :key="release.version" class="release-block">
        <p class="release-version"><strong>{{ release.version }}</strong></p>
        <ul class="bullet-list">
          <li v-for="(item, idx) in release.items" :key="idx">{{ item }}</li>
        </ul>
      </div>
    </section>

    <section class="card">
      <h2>🛠️ CORE v1 — En cours</h2>
      <ul class="check-list">
        <li v-for="(item, idx) in coreV1" :key="idx">{{ item }}</li>
      </ul>
    </section>

    <section class="card">
      <h2>⏳ CORE v2 — À venir</h2>
      <ul class="check-list">
        <li v-for="(item, idx) in coreV2" :key="idx">{{ item }}</li>
      </ul>
    </section>
  </div>
</template>


<script setup>
import { onMounted, ref } from 'vue'

onMounted(() => window.scrollTo(0, 0));

const releases = ref([
  { version: 'v1.4.1', items: ['Remove files before delete user'] },
  { version: 'v1.4.0', items: ['Add auth actions (verify, forgot, reset & delete)'] },
  { version: 'v1.3.2', items: ['Fix responsive'] },
  { version: 'v1.3.1', items: ['Add Terms of Service', 'Add About us page'] },
  { version: 'v1.3.0', items: ['Add upload video', 'Analyze and scan uploads'] },
  { version: 'v1.2.1', items: ['Fix config.'] },
  { version: 'v1.2.0', items: [
    'Add update article (in profile view)',
    'Isolate the upload folder and make it persistent',
    'Add Roadmap'
  ]},
  { version: 'v1.1.1', items: ['Fix multiples bugs.'] },
])

const coreV1 = ref([
  'A form allows users to feed the list of articles',
  'Users can comment on articles, like and associate tags',
  'Admin users can validate articles and associated tags',
  'Sort and filter articles by date, tags, pertinence',
  'Implement article reporting, gamification, i18n, infinite loading',
  'Buy domain & deploy on server',
  'Dockerize project',
  'Video upload & streaming',
  'File storage optimization',
  'Abuse reporting improvements',
  'Style improvement (Element+)',
  'CI/CD pipeline with Docker'
])

const coreV2 = ref([
  'SSR for SEO',
  'Accessibility features',
  'Security enhancements',
  'Performance: cache, CDN'
])
</script>

<style scoped>
.roadmap {
  max-width: 860px;
  margin: auto;
  padding: 2rem 1rem;
  font-size: 1rem;
  color: #444444;
}

h1 {
  font-size: 2rem;
  color: #863ec9;
  text-align: center;
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.3rem;
  color: #c0a4f4;
  margin-bottom: 1rem;
}

.card {
  background-color: rgba(97, 97, 97, 0.192);
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.123);
}

.release-block + .release-block {
  margin-top: 1rem;
}

.release-version {
  margin-bottom: 0.3rem;
  color: #424242;
}

.bullet-list {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0;
}

.check-list {
  list-style: none;
  padding-left: 0;
}


</style>
