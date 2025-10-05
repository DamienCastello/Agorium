// stores/processing.js
import { defineStore } from 'pinia'

export const useProcessingStore = defineStore('processing', {
  state: () => ({
    articleId: null,   // number | null
    status: null,      // 'queued' | 'processing' | 'ready' | 'failed' | null
    progress: 0,       // 0..100
    isPolling: false,
  }),
  actions: {
    // Start tracking a new processing job (called after POST /articles when it's a video)
    start(id) {
      this.articleId = id
      this.status = 'queued'
      this.progress = 0
      this.isPolling = true
    },

    // Update from /status endpoint response
    update({ status, progress }) {
      if (typeof progress === 'number') this.progress = progress
      if (status) this.status = status
    },

    // Mark as successfully done
    done() {
      this.status = 'ready'
      this.progress = 100
      this.isPolling = false
    },

    // Mark as failed
    fail() {
      this.status = 'failed'
      this.isPolling = false
    },

    // Clear everything (e.g., after redirect or leaving the page)
    clear() {
      this.articleId = null
      this.status = null
      this.progress = 0
      this.isPolling = false
    },
  },
})
