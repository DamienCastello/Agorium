<template>
  <div class="roadmap">
    <h1>📌 {{ $t('roadmap.title') }}</h1>

    <section class="card">
      <h2>📝 {{ $t('roadmap.title_releases') }}</h2>
      <div v-for="release in releases" :key="release.version" class="release-block">
        <p class="release-version"><strong>{{ release.version }}</strong></p>
        <ul class="bullet-list">
          <li v-for="(item, idx) in release.items" :key="idx">{{ item }}</li>
        </ul>
      </div>
    </section>

    <section class="card">
      <h2>🛠️ {{ $t('roadmap.title_core1') }}</h2>
      <ul class="check-list">
        <li v-for="(item, idx) in coreV1" :key="idx">{{ item }}</li>
      </ul>
    </section>

    <section class="card">
      <h2>⏳ {{ $t('roadmap.title_core2') }}</h2>
      <ul class="check-list">
        <li v-for="(item, idx) in coreV2" :key="idx">{{ item }}</li>
      </ul>
    </section>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

onMounted(() => window.scrollTo(0, 0))

const releasesDefs = ref([
  { version: 'v1.5.0', items: [
    'roadmap.releases.v150.l1',
    'roadmap.releases.v150.l2',
    'roadmap.releases.v150.l3',
    'roadmap.releases.v150.l4',
    'roadmap.releases.v150.l5',
    'roadmap.releases.v150.l6',
  ]},
  { version: 'v1.4.1', items: ['roadmap.releases.v141'] },
  { version: 'v1.4.0', items: ['roadmap.releases.v140'] },
  { version: 'v1.3.2', items: ['roadmap.releases.v132'] },
  { version: 'v1.3.1', items: ['roadmap.releases.v131.l1','roadmap.releases.v131.l2'] },
  { version: 'v1.3.0', items: ['roadmap.releases.v130.l1','roadmap.releases.v130.l2'] },
  { version: 'v1.2.1', items: ['roadmap.releases.v121'] },
  { version: 'v1.2.0', items: [
    'roadmap.releases.v120.l1',
    'roadmap.releases.v120.l2',
    'roadmap.releases.v120.l3',
  ]},
])

const coreV1Keys = ref([
  'roadmap.core1.l1','roadmap.core1.l2','roadmap.core1.l3','roadmap.core1.l4',
  'roadmap.core1.l5','roadmap.core1.l6','roadmap.core1.l7','roadmap.core1.l8',
  'roadmap.core1.l9','roadmap.core1.l10','roadmap.core1.l11','roadmap.core1.l12',
])

const coreV2Keys = ref([
  'roadmap.core2.l1','roadmap.core2.l2','roadmap.core2.l3',
])

// 2) On “projette” vers des textes via t() dans des computed (réactifs à la locale)
const releases = computed(() =>
  releasesDefs.value.map(r => ({
    version: r.version,
    items: r.items.map(k => t(k)),
  }))
)

const coreV1 = computed(() => coreV1Keys.value.map(k => t(k)))
const coreV2 = computed(() => coreV2Keys.value.map(k => t(k)))
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
  list-style: disc;
  padding-left: 0;
}


</style>
