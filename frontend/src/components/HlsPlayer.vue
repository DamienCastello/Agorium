<template>
  <video
    ref="videoEl"
    class="hls-video"
    controls
    preload="metadata"
    :poster="posterUrl || null"
    :width="String(width)"
    playsinline
  />
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import Hls from 'hls.js'
import url from '@/utils/url'

const props = defineProps({
  // Relative HLS master path (e.g., "uploads/hls/<uuid>/master.m3u8")
  hlsPlaylist: { type: String, required: true },
  // Optional MP4 processed fallback (e.g., "uploads/videos/processed/xxx.mp4")
  mp4Fallback: { type: String, default: null },
  // Optional poster relative path (e.g., "uploads/thumbnails/xxx.jpg")
  poster: { type: String, default: null },
  // Video width attribute (number or string)
  width: { type: [String, Number], default: 600 },
})

const videoEl = ref(null)
let hls = null

const hlsUrl = computed(() => `${url.baseUrl}/${props.hlsPlaylist}`)
const mp4Url = computed(() => (props.mp4Fallback ? `${url.baseUrl}/${props.mp4Fallback}` : null))
const posterUrl = computed(() => (props.poster ? `${url.baseUrl}/${props.poster}` : null))

function destroyHls() {
  if (hls) {
    try { hls.destroy() } catch (_) {}
    hls = null
  }
}

function canPlayNativeHls() {
  const v = document.createElement('video')
  // Safari & iOS return 'probably'/'maybe' for application/vnd.apple.mpegurl
  const t = v.canPlayType('application/vnd.apple.mpegurl')
  return t === 'probably' || t === 'maybe'
}

function setupHls() {
  const el = videoEl.value
  if (!el) return

  destroyHls()

  // 1) Native HLS (Safari)
  if (canPlayNativeHls()) {
    el.src = hlsUrl.value
    el.load()
    return
  }

  // 2) hls.js path (ABR in JS)
  if (Hls.isSupported()) {
    // ABR/mobile-friendly defaults
    hls = new Hls({
      // Do not request levels larger than the player size
      capLevelToPlayerSize: true,
      // Start at the lowest level automatically if unknown
      startLevel: -1,
      // Short buffers to react quickly on mobile networks
      maxBufferLength: 10,     // seconds
      maxMaxBufferLength: 30,
      backBufferLength: 30,
      // enableWorker: true is default in recent Hls.js; omitting to avoid issues in some bundlers
      // lowLatencyMode: false here (we’re on VOD, not live)
    })

    hls.attachMedia(el)
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(hlsUrl.value)
    })

    // If network looks slow, force an initial low level (e.g., 360p)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      const et = navigator.connection?.effectiveType // 'slow-2g'|'2g'|'3g'|'4g'...
      if (et && ['slow-2g', '2g', '3g'].includes(et)) {
        const lowIdx = hls.levels.findIndex(L => (L.height || 0) <= 360)
        if (lowIdx >= 0) {
          // Force initial low level; ABR can still ramp up later
          hls.currentLevel = lowIdx
        }
      }
      // Autoplay may be blocked; let user click play if needed
      // el.play().catch(() => {})
    })

    // Fallback to MP4 if fatal error occurs
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data?.fatal && mp4Url.value) {
        destroyHls()
        el.src = mp4Url.value
        el.load()
      }
    })
    return
  }

  // 3) No Hls.js support: last-resort MP4 fallback
  if (mp4Url.value) {
    el.src = mp4Url.value
    el.load()
  }
}

onMounted(() => {
  setupHls()
})

onBeforeUnmount(() => {
  destroyHls()
})

// Re-init if any of these change
watch(() => props.hlsPlaylist, () => setupHls())
watch(() => props.mp4Fallback, () => setupHls())
</script>

<style scoped>
.hls-video {
  max-width: 100%;
  height: auto;
}
</style>
