<template>
  <fieldset class="pico">
    <div class="file-upload">
      <FadeSlideTransition>
        <div>
          <div v-if="mode === 'update'">
            <p>Vidéo actuelle:</p>
            <video  :src="getSrc(videoPreview)" 
                    :poster="videoThumbnail ? `${url.baseUrl}/${videoThumbnail}` : null"
              alt="Preview" class="preview" preload="metadata"/>
          </div>
          <div v-if="mode === 'create' && videoPreview">
            <video  :src="getSrc(videoPreview)" 
                    :poster="videoThumbnail ? `${url.baseUrl}/${videoThumbnail}` : null"
              alt="Preview" class="preview" preload="metadata"/>

          </div>
        </div>
      </FadeSlideTransition>
      
      <label for="avatar">{{ $t('publish.preview_video') }} <span style="color: red">*</span></label>
      <input type="file" id="fileInput" hidden @change="handleFileUpload" accept="video/*"
        :disabled="navbarStore.isMenuOpen || navbarStore.isTranslationOpen" />
      <label for="fileInput" class="custom-label"
        :class="{ 'disabled': navbarStore.isMenuOpen || navbarStore.isTranslationOpen }"
        :data-content="$t('publish.browse')">
        {{ $t('publish.placeholder_file') }}
      </label>
    </div>
  </fieldset>
</template>


<script setup>
import FadeSlideTransition from "@/transitions/FadeSlideTransition.vue";
import { useNavbarStore } from "@/stores/navbar";
import url from "@/utils/url";
import getSrc from "@/utils/getSrc";
import { onBeforeUnmount } from "vue";

const navbarStore = useNavbarStore();

const props = defineProps({
  mode: String,
  videoThumbnail: String,
  videoPreview: String
});

const emit = defineEmits(["update:selectedFile", "update:videoPreview", "update:videoThumbnail"]);

// Keep track of the current blob URL so we can revoke it
let currentObjectUrl = null;

/** Create a blob URL from a File and emit it upward */
function setPreviewFromFile(file) {
  // Revoke previous Object URL to avoid memory leaks
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
  currentObjectUrl = URL.createObjectURL(file);
  emit("update:videoPreview", currentObjectUrl);
}

function handleFileUpload(event) {
  const file = event.target.files?.[0];

  if (file) {
    // 1) expose the File upward
    emit("update:selectedFile", file);
    // 2) clear any previous thumbnail (server will regenerate one)
    emit("update:videoThumbnail", null);
    // 3) set preview from object URL
    setPreviewFromFile(file);
  } else {
    // Reset state if no file selected
    emit("update:videoPreview", null);
    emit("update:selectedFile", null);
  }

  // Allow selecting the same file again (reset input value)
  // (some browsers don't fire change if the same file is chosen twice)
  event.target.value = "";
}

// Register lifecycle hook at setup-time (NOT inside handlers)
// Ensures we always revoke the blob URL when the component unmounts
onBeforeUnmount(() => {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
});
</script>

<style scoped>
.file-upload {
  position: relative;
  display: inline-block;
}

.custom-label {
  display: inline-block;
  padding: 8px 12px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s, border-color 0.3s, color 0.3s;
}

.custom-label:hover {
  background-color: #e9e9e9;
}

.custom-label::after {
  content: attr(data-content);
  ;
  display: inline-block;
  margin-left: 10px;
  font-size: 16px;
  background-color: rgb(64, 64, 191);
  color: white;
  border: 1px solid rgb(63, 51, 131);
  border-radius: 5px;
  cursor: pointer;
  padding: 4px 6px;
  transition: background-color 0.2s, border-color 0.2s;
}

.custom-label.disabled {
  background-color: #f0f0f0;
  border-color: #ddd;
  color: #aaa;
  cursor: not-allowed;
  pointer-events: none;
}

.custom-label.disabled::after {
  background-color: #9980f2;
  opacity: 0.5;
}

.preview {
  max-width: 300px;
  max-height: 300px;
  margin-bottom: 15px;
  border: 1px solid grey;
}
</style>
