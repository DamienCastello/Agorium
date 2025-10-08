<template>
  <video
    ref="videoEl"
    class="hls-video"
    controls
    preload="metadata"
    :poster="posterUrl || null"
    playsinline
  />
</template>

<script setup>
// Lightweight HLS player with MP4 fallback.
// - If browser supports native HLS (Safari), feed .m3u8 directly.
// - Else use hls.js to attach the .m3u8 source.
// - If HLS fails, fallback to MP4 if provided.

import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Hls from 'hls.js'
import url from '@/utils/url' // same util you already use

const props = defineProps({
  // Relative path like "uploads/hls/<uuid>/master.m3u8"
  hlsPlaylist: { type: String, required: true },
  // Optional fallback MP4 relative path: "uploads/videos/processed/xxx.mp4"
  mp4Fallback: { type: String, default: null },
  // Optional poster relative path: "uploads/thumbnails/xxx.jpg"
  poster: { type: String, default: null },
  // Optional width attribute
  width: { type: [String, Number], default: 600 },
})

const videoEl = ref(null)
let hlsInstance = null

const playlistUrl = () => `${url.baseUrl}/${props.hlsPlaylist}`
const mp4Url = () => (props.mp4Fallback ? `${url.baseUrl}/${props.mp4Fallback}` : null)
const posterUrl = props.poster ? `${url.baseUrl}/${props.poster}` : null

function destroyHls() {
  // Clean hls instance to prevent memory leaks
  if (hlsInstance) {
    try { hlsInstance.destroy() } catch (_) {}
    hlsInstance = null
  }
}

function canPlayNativeHls() {
  // Safari (and some mobile browsers) can play application/vnd.apple.mpegurl natively
  const v = document.createElement('video')
  return v.canPlayType('application/vnd.apple.mpegurl') === 'probably' ||
         v.canPlayType('application/vnd.apple.mpegurl') === 'maybe'
}

function attachHls() {
  const el = videoEl.value
  if (!el) return

  destroyHls()

  const srcM3U8 = playlistUrl()

  if (canPlayNativeHls()) {
    // Native HLS (Safari): just set the src to .m3u8
    el.src = srcM3U8
    el.load()
    return
  }

  if (Hls.isSupported()) {
    // hls.js path
    hlsInstance = new Hls({
      // Reasonable defaults (tweak as needed)
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    })
    hlsInstance.loadSource(srcM3U8)
    hlsInstance.attachMedia(el)

    // Optional: error handling with fallback to MP4
    hlsInstance.on(Hls.Events.ERROR, (_, data) => {
      // Media or network fatal error → fallback if possible
      if (data?.fatal && props.mp4Fallback) {
        destroyHls()
        el.src = mp4Url()
        el.load()
      }
    })
  } else {
    // Last-resort: fallback to MP4 if provided
    if (props.mp4Fallback) {
      el.src = mp4Url()
      el.load()
    }
  }
}

onMounted(() => {
  // Set width attribute if provided
  if (videoEl.value && props.width) {
    videoEl.value.setAttribute('width', String(props.width))
  }
  attachHls()
})

onBeforeUnmount(() => {
  destroyHls()
})

// If props change dynamically, re-attach
watch(() => props.hlsPlaylist, () => attachHls())
watch(() => props.mp4Fallback, () => attachHls())
</script>

<style scoped>
.hls-video {
  max-width: 100%;
  height: auto;
}
</style>
