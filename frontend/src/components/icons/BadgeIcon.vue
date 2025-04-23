<template>
    <div class="badge-container pico">
        <div>
            <div class="icon-container">
                <span class="badge-name">{{ badge?.description }}</span>
                <i :class="['fa-solid', icon]"></i>
                <span class="icon-text">{{ parseInt(badge?.threshold) }}</span>
            </div>
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
const badge = ref(null);

const iconTextLeft = computed(() => {
    const threshold = parseInt(badge?.threshold);
    if (threshold >= 100 && threshold <= 999) {
        return '35%';
    }
    else if (threshold >= 10 && threshold <= 99) {
        return '40%';
    }
    return '45%';
});

onMounted(() => {
    axios
        .get(`${url.baseUrl}/api/v1/achievements/${props.id}`, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        })
        .then((response) => {
            badge.value = response.data.achievement;
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
  justify-content: flex-end;
  align-items: center;
  z-index: 1;
  min-width: clamp(80px, 16vw, 130px);
  max-width: clamp(80px, 16vw, 130px);
}

.icon-container {
    position: relative;
    width: clamp(70px, 15vw, 110px);
    height: clamp(70px, 15vw, 110px);
    border-radius: 50%;
    border: 2px solid black;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.548);
    /* ou transparent selon le style que tu veux */
    transition: transform 0.3s ease, background-color 0.3s ease;
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
    background-color: #d1d1d1;
}

.icon-container i {
    font-size: clamp(30px, 8vw, 60px);
    color: white;
    z-index: 2;
}

.icon-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: clamp(14px, 1.5vw, 24px);
    color: black;
    font-weight: bold;
    z-index: 3;
    pointer-events: none;
}

.badge-name {
    visibility: hidden;
    position: absolute;
    top: 105%;
    left: 50%;
    transform: translateX(-50%);
    font-size: clamp(12px, 1vw, 16px);
    padding: 2px 4px;
    background-color: black;
    color: white;
    text-align: center;
    border-radius: 6px;
    min-width: 180px;
    z-index: 10;
}

.icon-container:hover .badge-name {
    visibility: visible;
}
</style>
