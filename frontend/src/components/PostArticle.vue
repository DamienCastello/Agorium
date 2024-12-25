<template>
  <div>
    <h1>Poster un nouvel article</h1>
    <fieldset>
      <label>
        <input
          name="withVideo"
          type="checkbox"
          role="switch"
          @click="toggleWithVideo"
          checked
        />
        Inclure une vidéo youtube
      </label>
    </fieldset>
    <form @submit.prevent="handleSubmit">
      <fieldset>
        <label for="title">Titre <span style="color: red">*</span></label>
        <input
          id="title"
          type="text"
          placeholder="Article de zinzin"
          v-model="form.title"
        />
      </fieldset>
      <fieldset>
        <label for="description"
          >Description <span style="color: red">*</span></label
        >
        <textarea
          id="description"
          :placeholder="lorem"
          v-model="form.description"
          rows="5"
          cols="33"
        ></textarea>
      </fieldset>

      <FadeSlideTransition>
        <component
          :is="componentToShow"
          :imagePreview="imagePreview"
          @update:selectedFile="updateSelectedFile"
          @update:imagePreview="updateImagePreview"
        />
      </FadeSlideTransition>

      <button type="submit">Poster l'article</button>
    </form>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, computed } from "vue";
import url from "@/utils/url";
import UrlYoutubeFieldset from "./UrlYoutubeFieldset.vue";
import ImageSelector from "./ImageSelector.vue";
import FadeSlideTransition from "@/transitions/FadeSlideTransition.vue";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

// Reactive data
const form = ref({
  title: "",
  description: "",
});
const withVideo = ref(true);
const selectedFile = ref(null);
const imagePreview = ref(null);

// Toggle between video and image
const toggleWithVideo = () => {
  withVideo.value = !withVideo.value;
};

// Dynamically select component
const componentToShow = computed(() => {
  return withVideo.value ? UrlYoutubeFieldset : ImageSelector;
});

// Update selected file from child
const updateSelectedFile = (file) => {
  selectedFile.value = file;
};

const updateImagePreview = (preview) => {
  imagePreview.value = preview;
};

// Submit form
const handleSubmit = () => {
  if (!selectedFile.value && !withVideo.value) {
    alert("Please select an image or include a YouTube URL!");
    return;
  }

  const formData = new FormData();
  formData.append("title", form.value.title);
  formData.append("description", form.value.description);
  if (!withVideo.value) formData.append("image", selectedFile.value);
  // TODO: set formData append userId connected

  axios
    .post(`${url.baseUrl}:${url.portBack}/api/v1/articles/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      console.log("Article successfully created:", response.data);
    })
    .catch((error) => {
      console.error("Error creating article:", error);
    });
};
</script>
