<template>
    <fieldset>
      <label for="image">Upload une image:</label>
      <input
        type="file"
        id="image"
        @change="handleFileUpload"
        accept="image/*"
      />
      <FadeSlideTransition>
        <div v-if="imagePreview">
        <h3>Preview:</h3>
        <img
          :src="imagePreview"
          alt="Preview"
          style="max-width: 300px; max-height: 300px"
        />
      </div>
      </FadeSlideTransition>
    </fieldset>
  </template>
  
  <script setup>
  import FadeSlideTransition from "@/transitions/FadeSlideTransition.vue";

  const props = defineProps(["imagePreview"]);
  const emit = defineEmits(["update:selectedFile", , "update:imagePreview"]);
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      emit("update:selectedFile", file);
  
      const reader = new FileReader();
      reader.onload = (e) => {
        emit("update:imagePreview", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  </script>
  