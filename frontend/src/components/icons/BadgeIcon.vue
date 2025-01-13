<template>
    <div class="badge-container">
        <span>{{ badge?.name }}</span>
    <div class="icon-container">
        <i class="fa-solid fa-shield"></i>
        <span class="badge-name">{{ badge?.description }}</span>
        <span class="icon-text" :style="{ left: iconTextLeft }">{{ parseInt(badge?.threshold) }}</span>
        <i :class="icon"></i>
    </div>
    </div>
    <notifications position="bottom right" />
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import axios from 'axios';
import url from '@/utils/url';
import { useNotification } from "@kyvg/vue3-notification";

const props = defineProps({
  id: Number,
  icon: String
});
const { notify } = useNotification();
const badge = ref(null)

const iconTextLeft = computed(() => {
  const threshold = parseInt(badge.value?.threshold);

  if (threshold >= 100 && threshold <= 999) {
    return '36px';
  } 
  else if (threshold >= 10 && threshold <= 99) {
    return '40px';
  }
  return '46px';
});

onMounted(() => {
    axios
        .get(`${url.baseUrl}:${url.portBack}/api/v1/achievements/${props.id}`, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        })
        .then((response) => {
            badge.value = response.data.achievement        
        })
        .catch((error) => {
            notify({
                title: "Error Fetching User",
                type: 'error',
                text: error.message,
            });
        });
});

</script>

<style scoped>
.badge-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1;
}

.icon-container {
    position: relative;
    border: 2px solid black;
    width: 110px;
    height: 110px;
    border-radius: 50%;
    padding-top: 4px;
    
}

.icon-container .badge-name {
  visibility: hidden;
  top: 105%;
  left: -35%;
  font-size: 14px;
  padding: 1px 2px;
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  position: absolute;
  z-index: 10;
  min-width: 180px;
}

.icon-container:hover {
    transform: scale(1.05);
    transition: background-color 0.3s ease; /* Ajoute une transition pour un effet fluide */
    background-color: #d1d1d1;
    z-index: 1;
}

.icon-container:hover .badge-name {
  visibility: visible;
  z-index: 10;
}

i.fa-shield {
    vertical-align: middle;
    font-size: 90px;
}

.icon-text {
    position: absolute;
    left: 43px;
    top: 30px;
    color: black;
    font-weight: bold;
    z-index: 5;
}

i.fa-comment {
    font-size: 50px;
    color: white;
    position: absolute;
    left: 28px;
    top: 23px;
}
</style>