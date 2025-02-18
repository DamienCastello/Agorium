<template>
  <fieldset class="pico">
        <div class="file-upload">
          <label for="avatar">{{ $t('publish.preview') }}</label>
          <input type="file" id="fileInput" hidden @change="handleFileUpload"
            :disabled="navbarStore.isMenuOpen || navbarStore.isTranslationOpen" />
          <label for="fileInput" class="custom-label"
            :class="{ 'disabled': navbarStore.isMenuOpen || navbarStore.isTranslationOpen }"
            :data-content="$t('publish.placeholder_file')">
            {{ $t('publish.placeholder_file') }}
          </label>
        </div>

    <FadeSlideTransition>
      <div v-if="imagePreview">
        <img :src="imagePreview" alt="Preview" class="preview" />
      </div>
    </FadeSlideTransition>
  </fieldset>
</template>

<script setup>
import FadeSlideTransition from "@/transitions/FadeSlideTransition.vue";
import { useNavbarStore } from "@/stores/navbar";

const navbarStore = useNavbarStore();
const props = defineProps({
  imagePreview: String
});

const emit = defineEmits(["update:selectedFile", "update:imagePreview"]);

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  
  if (file) {
    emit("update:selectedFile", file);

    const reader = new FileReader();
    reader.onload = (e) => {
      emit("update:imagePreview", e.target.result);
    };
    reader.readAsDataURL(file);
  } else {
    emit("update:imagePreview", null);
    emit("update:selectedFile", null);
  }
};
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
  content: attr(data-content);;
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
