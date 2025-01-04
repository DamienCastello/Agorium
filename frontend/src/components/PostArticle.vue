<template>
  <div>
    <h1>Poster un nouvel article</h1>
      
        <label>
        <input
        class="switch"
          name="withVideo"
          type="checkbox"
          role="switch"
          @click="toggleWithVideo"
          checked
        />
        Inclure une vidéo youtube
      </label>
      
      
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
        <label for="description">Description <span style="color: red">*</span></label>
        <textarea
          id="description"
          :placeholder="lorem"
          v-model="form.description"
          rows="5"
          cols="33"
        ></textarea>
      </fieldset>

      <div v-if="state === 'error'">
        <p>Impossible de charger les tags</p>
      </div>
      <div v-else-if="state === 'loading'">
        <p>Chargement des tags...</p>
      </div>

      <div v-else>
        <label>Tags <span style="color: red">*</span></label>
        <div
          class="dropdown"
          :class="{ open: isDropdownOpen }"
          ref="dropdownRef"
        >
          <div class="dropdown-toggle" @click="toggleDropdown">
            <div class="selected-tags-container">
              <span
                v-for="(tag, index) in selectedTags"
                :key="index"
                class="selected-tag"
              >
                {{ tag.name }}
              </span>
              <span class="dropdown-placeholder" v-if="selectedTags.length === 0">
                Choisir un ou plusieurs tags
              </span>
            </div>
          </div>
          <div v-if="isDropdownOpen" class="dropdown-content">
            <div class="tags-list">
              <label
                v-for="(tag, index) in tags"
                :key="tag.id"
                class="tag-item"
                :class="{ selected: selectedTags.includes(tag) }"
              >
                <input
                  type="checkbox"
                  :value="tag"
                  v-model="selectedTags"
                  @change="logSelectedTags"
                />
                {{ tag.name }}
              </label>
            </div>
            <div class="add-tag-container">
              <label for="new-tag">Créer un nouveau tag</label>
              <div class="add-tag">
                <input
                  id="new-tag"
                  type="text"
                  placeholder="Ajouter un tag"
                  v-model="newTag"
                  @keyup.enter="addTag"
                  class="new-tag-input"
                />
                <button @click="addTag" type="button" class="add-tag-button">Ajouter</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FadeSlideTransition>
        <component
          :is="componentToShow"
          :imagePreview="imagePreview"
          v-model="form.urlYoutube"
          @update:selectedFile="updateSelectedFile"
          @update:imagePreview="updateImagePreview"
        />
      </FadeSlideTransition>
      <p v-if="selectedTags.length === 0" class="comment-info">Sélectionnez au moins un tag.</p>      
      <button 
        type="submit" 
        :disabled="selectedTags.length === 0"
      >
          Poster l'article
      </button>
    </form>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "@/stores/auth";
import url from "@/utils/url";
import UrlYoutubeFieldset from "./UrlYoutubeFieldset.vue";
import ImageSelector from "./ImageSelector.vue";
import FadeSlideTransition from "@/transitions/FadeSlideTransition.vue";
import { useRouter } from "vue-router";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

const form = ref({
  title: "",
  description: "",
  urlYoutube: ""
});

const authStore = useAuthStore();
const router = useRouter();

const state = ref("loading");
const tags = ref([]);
const selectedTags = ref([]);
const withVideo = ref(true);
const selectedFile = ref(null);
const imagePreview = ref(null);
const isDropdownOpen = ref(false);
const dropdownRef = ref(null);
const newTag = ref("");

const addTag = () => {
  if (!newTag.value.trim()) return;

  const tagExists = tags.value.some((tag) => tag.name.toLowerCase() === newTag.value.toLowerCase());
  if (tagExists) {
    alert("Ce tag existe déjà !");
    newTag.value = "";
    return;
  }

  const newTagObject = { name: newTag.value };

  state.value = "loading";

  axios
    .post(`${url.baseUrl}:${url.portBack}/api/v1/tags/`, newTagObject, {
      withCredentials: true,
      headers: {
        "Authorization": `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
    })
    .then(() => {
      console.log("Tag créé avec succès.", newTagObject);

      return axios.get(`${url.baseUrl}:${url.portBack}/api/v1/tags/`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
    })
    .then((response) => {
      if (response.data && response.data.tags) {
        tags.value = response.data.tags;
      }

      newTag.value = "";
      state.value = "idle";
    })
    .catch((error) => {
      console.error("Erreur lors de la création du tag:", error);
      state.value = "error";
    });
};

const logSelectedTags = () => {
  console.log("Tags sélectionnés:", selectedTags.value);
};

const toggleWithVideo = () => {
  withVideo.value = !withVideo.value;
};

const componentToShow = computed(() => {
  return withVideo.value ? UrlYoutubeFieldset : ImageSelector;
});

const updateSelectedFile = (file) => {
  selectedFile.value = file;
};

const updateImagePreview = (preview) => {
  imagePreview.value = preview;
};

onMounted(() => {
  axios
    .get(`${url.baseUrl}:${url.portBack}/api/v1/tags/`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
    .then((response) => {
      if (response.data && response.data.tags) {
        tags.value = response.data.tags;
        state.value = "idle";
      } else {
        state.value = "error";
      }
    })
    .catch((error) => {
      console.log("Erreur lors de la récupération des tags:", error.message);
      state.value = "error";
    });

  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

const handleSubmit = () => {
  if (!selectedFile.value && !withVideo.value) {
    alert("Veuillez sélectionner une image ou inclure une URL YouTube !");
    return;
  }

  const cleanedTags = selectedTags.value.map(tag => {
    const { createdAt, updatedAt, ...cleanTag } = tag; 
    return cleanTag;
  });

  const formData = new FormData();
  formData.append("title", form.value.title);
  formData.append("description", form.value.description);
  if (!withVideo.value) formData.append("preview", selectedFile.value);
  else formData.append("urlYoutube", form.value.urlYoutube);

  formData.append("userId", authStore.user.id);
  formData.append("tags", JSON.stringify(cleanedTags));

  axios
    .post(`${url.baseUrl}:${url.portBack}/api/v1/articles/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      console.log("Article créé avec succès:", response.data);
      router.push("/articles");
    })
    .catch((error) => {
      console.error("Erreur lors de la création de l'article:", error);
    });
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};
</script>

<style scoped>
input.switch {
  min-width: 50px !important;
}

.dropdown-placeholder {
  font-size: 18px;
  font-weight: lighter;
  color:#8d8d8d;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.dropdown {
  position: relative;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border-color 0.3s;
  z-index: 1;
  max-width: 100%;
  margin-bottom: 40px;
}

.dropdown.open {
  border-color: #6400e4;
  border-width: 2px;
  z-index: 2;
}

.dropdown-toggle {
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 455px;
}
@media (max-width: 768px) {
  .dropdown-toggle {
    max-width: 292px;
  }
}

.selected-tags-container {
  max-width: 100%;
  max-height: 100px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dropdown-content {
  display: none;
  position: absolute;
  width: 100%;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  top: calc(100% + 2px);
  left: 0;
  z-index: 1;
  max-height: 200px;
  overflow-y: auto;
  padding: 5px;
  box-sizing: border-box;
}

.dropdown.open .dropdown-content {
  display: block;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
  max-width: 100%;
}

.tag-item {
  padding: 4px 8px;
  border-radius: 12px;
  border: 2px solid #6400e4;
  cursor: pointer;
  display: inline-block;
  font-size: 12px;
  box-sizing: border-box;
  transition: background-color 0.3s, color 0.3s;
}

.tag-item.selected {
  background-color: #6400e4;
  color: white;
  border-color: #6400e4;
}

.selected-tag {
  padding: 4px 8px;
  background-color: #6400e4;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  margin: 0 4px 4px 0;
}

.tags-list input[type="checkbox"] {
  display: none;
}

.tags-list label {
  display: block;
  cursor: pointer;
}

.add-tag-container {
  margin-top: 20px;
}

.add-tag {
  display: flex;
  justify-content: center;
  align-items: center;
}

.new-tag-input {
  width: 75%;
  padding: 8px;
  border: 1px solid #5f5f5f;
  border-radius: 5px;
  margin: 10px 0;
  box-sizing: border-box;

}

.add-tag-button {
  padding: 3px 8px;
  background-color: #6400e4;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin: 10px 10px;
}

.add-tag-button:hover {
  background-color: #4b00b3;
}
</style>
