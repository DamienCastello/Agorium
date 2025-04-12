<template>
  <div v-if="state === 'error'">
    <p>{{ $t('publish.state_error') }}</p>
  </div>
  <div v-else-if="state === 'loading'">
    <p>{{ $t('publish.state_loading') }}</p>
  </div>
  <div v-else class="pico">
    <div @mousedown="handleClickOutsideNavbar">
      <h1>{{ $t('publish.title') }}</h1>

      <label>
        <input class="switch" name="withVideo" type="checkbox" role="switch" @click="toggleWithVideo" checked />
        {{ $t('publish.switch_video') }}
      </label>


      <form @submit.prevent="handleSubmit">
        <fieldset>
          <label for="title">{{ $t('publish.label_title') }}<span style="color: red">*</span></label>
          <input id="title" type="text" :placeholder="$t('publish.placeholder_title')" v-model="form.title" />
        </fieldset>
        <fieldset>
          <label for="description">{{ $t('publish.label_description') }}<span style="color: red">*</span></label>
          <textarea id="description" :placeholder="lorem" v-model="form.description" rows="5" cols="33"></textarea>
        </fieldset>

        <label>Tags <span style="color: red">*</span></label>
        <div class="dropdown" :class="{ open: isDropdownOpen }" ref="dropdownRef">
          <div class="dropdown-toggle" @click="toggleDropdown">
            <div class="selected-tags-container">
              <span v-for="(tag, index) in selectedTags" :key="index" class="selected-tag">
                {{ tag.name }}
              </span>
              <span class="dropdown-placeholder" v-if="selectedTags.length === 0">
                {{ $t('publish.label_tags') }}
              </span>
            </div>
          </div>
          <div v-if="isDropdownOpen" class="dropdown-content">
            <div class="tags-list">
              <label v-for="(tag, index) in tags" :key="tag.id" class="tag-item"
                :class="{ selected: selectedTags.includes(tag) }">
                <input type="checkbox" :value="tag" v-model="selectedTags" @change="logSelectedTags" />
                {{ tag.name }}
              </label>
            </div>
            <div class="add-tag-container">
              <label for="new-tag">{{ $t('publish.new_tag') }}</label>
              <div class="add-tag">
                <input id="new-tag" type="text" :placeholder="$t('publish.placeholder_tag')" v-model="newTag" @keyup.enter="addTag"
                  class="new-tag-input" />
                <button @click="addTag" type="button" class="add-tag-button">{{ $t('publish.add_button') }}</button>
              </div>
            </div>
          </div>
        </div>

        <FadeSlideTransition>
          <component 
            :is="componentToShow"
            v-model="form.urlYoutube"
            :imagePreview="imagePreview"
            @update:selectedFile="updateSelectedFile"
            @update:imagePreview="updateImagePreview"
          />
        </FadeSlideTransition>
        <p v-if="selectedTags.length === 0" class="comment-info">{{ $t('publish.tag_required') }}</p>
        <button type="submit" :disabled=" !isFormValid || selectedTags.length === 0 || isDropdownOpen || navbarStore.isMenuOpen">
          {{ $t('publish.submit_button') }}
        </button>
      </form>
    </div>
  </div>
  <notifications position="bottom right" />
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
import { useNavbarStore } from "../stores/navbar";
import { useNotification } from "@kyvg/vue3-notification";
import extractVideoId from "@/utils/extractYoutubeUrl";
import { useI18n } from "vue-i18n";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

const form = ref({
  title: "",
  description: "",
  urlYoutube: ""
});

const authStore = useAuthStore();
const navbarStore = useNavbarStore();
const router = useRouter();
const { notify } = useNotification();
const { t } = useI18n();

const state = ref("loading");
const tags = ref([]);
const selectedTags = ref([]);
const withVideo = ref(true);
const selectedFile = ref(null);
const imagePreview = ref(null);
const isDropdownOpen = ref(false);
const isClosingNavbar = ref(false);
const dropdownRef = ref(null);
const newTag = ref("");

const isFormValid = computed(() => {
  return form.value.title && form.value.description && (withVideo.value ? form.value.urlYoutube : selectedFile.value);
});

const addTag = () => {
  if (!newTag.value.trim()) return;

  const tagExists = tags.value.some((tag) => tag.name.toLowerCase() === newTag.value.toLowerCase());
  if (tagExists) {
    notify({
      title: t('notification.title.tag_exists'),
      type: 'warn',
      text: t('notification.text.tag_exists'),
    });
    newTag.value = "";
    return;
  }

  const newTagObject = { name: newTag.value };

  state.value = "loading";

  axios
    .post(`${url.baseUrl}/api/v1/tags/`, newTagObject, {
      withCredentials: true,
      headers: {
        "Authorization": `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
      },
    })
    .then(() => {
      notify({
        title: t('notification.title.tag_create'),
        type: 'success',
        text: t('notification.text.tag_create'),
      });

      return axios.get(`${url.baseUrl}/api/v1/tags/`, {
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
      notify({
        title: t('notification.title.error_tag_create'),
        type: 'error',
        text: error.response.data.message,
      });
      state.value = "error";
    });
};

const toggleWithVideo = () => {
  withVideo.value = !withVideo.value;

  if (withVideo.value) {
    selectedFile.value = null;
    imagePreview.value = null;
  } else {
    form.value.urlYoutube = "";
  }
};

const componentToShow = computed(() => {
  return withVideo.value ? UrlYoutubeFieldset : ImageSelector;
});

const updateSelectedFile = (file) => {
  selectedFile.value = file;
  const fileName = file?.name.length > 0 ? file?.name : "Aucun fichier choisi";
  document.querySelector('.custom-label').textContent = fileName;
};

const updateImagePreview = (preview) => {
  imagePreview.value = preview;
};

onMounted(() => {
  axios
    .get(`${url.baseUrl}/api/v1/tags/`, {
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
      notify({
        title: t('notification.title.error_tags_fetch'),
        type: 'error',
        text: error.response.data.message,
      });
      state.value = "error";
    });

  //handle click outside tag dropdown
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

const handleClickOutsideNavbar = (event) => {
  if (navbarStore.isMenuOpen) {
    event.preventDefault();
    event.stopPropagation();

    isClosingNavbar.value = true;
    navbarStore.closeMenu();

    setTimeout(() => {
      isClosingNavbar.value = false;
    }, 200);
  } 
  if (navbarStore.isTranslationOpen) {
    event.preventDefault();
    event.stopPropagation();

    isClosingNavbar.value = true;
    navbarStore.closeTranslation();

    setTimeout(() => {
      isClosingNavbar.value = false;
    }, 200);
  } else {
    return true;
  }
};

const handleSubmit = () => {
  if (!selectedFile.value && !withVideo.value || !form.value.urlYoutube && withVideo.value) {
    notify({
      title: t('notification.title.field_media_required'),
      type: 'warn',
      text: t('notification.text.field_media_required'),
    });
    return;
  }

  const cleanedTags = selectedTags.value.map(tag => {
    const { createdAt, updatedAt, ...cleanTag } = tag;
    return cleanTag;
  });

  const formData = new FormData();

  // Verify youtube ID is valid
  const isValidYoutubeId = extractVideoId(form.value.urlYoutube)

  formData.append("title", form.value.title);
  formData.append("description", form.value.description);
  if (!withVideo.value) {
    formData.append("preview", selectedFile.value)
  } else {
    if (!isValidYoutubeId) {
      notify({
        title: t('notification.title.field_media_required'),
        type: 'warn',
        text: t('notification.text.field_media_url'),
      });
    }
    formData.append("urlYoutube", form.value.urlYoutube);
  }


  formData.append("userId", authStore.user.id);
  formData.append("tags", JSON.stringify(cleanedTags));

  if (isValidYoutubeId) {
    axios
      .post(`${url.baseUrl}/api/v1/articles/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        state.value = 'loading';
        notify({
          title: t('notification.title.article_create'),
          type: 'success',
          text: t('notification.text.article_create'),
        });
        setTimeout(() => {
          // Have to delete timeout in V2
          state.value = 'idle';
          router.push("/articles");
        }, 2000);
      })
      .catch((error) => {
        console.log("error : ", error)
        notify({
          title: t('notification.title.article_create'),
          type: 'error',
          text: error.response.data.message,
        });
        state.value = 'error';
      });
  }


};

const toggleDropdown = () => {
  if (isClosingNavbar.value) {
    return;
  }

  isDropdownOpen.value = !isDropdownOpen.value;
};
</script>

<style scoped>
input.switch {
  min-width: 30px !important;
}

.dropdown-placeholder {
  font-size: 18px;
  font-weight: lighter;
  color: #8d8d8d;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.dropdown {
  position: relative;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border-color 0.3s;
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
  max-height: 270px;
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
