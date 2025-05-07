<template>
    <div v-if="state === 'error'">
        <p>{{ $t('update.state_error') }}</p>
    </div>
    <div v-else class="pico" v-loading="state === 'loading'" :element-loading-text="$t('publish.state_loading')">
        <div @mousedown="handleClickOutsideNavbar">
            <h1>{{ $t('update.title') }}</h1>


            <form @submit.prevent="handleSubmit">
                <fieldset>
                    <label for="title">{{ $t('update.label_title') }}<span style="color: red">*</span></label>
                    <p v-if="!refusalReasons.title.isValid" class="validation-message">{{ refusalReasons.title.value }}
                    </p>
                    <input id="title" type="text" :placeholder="$t('update.placeholder_title')" v-model="form.title" />
                </fieldset>

                <fieldset>
                    <label for="description">{{ $t('update.label_description') }}<span
                            style="color: red">*</span></label>
                    <p v-if="!refusalReasons.description.isValid" class="validation-message">{{
                        refusalReasons.description.value }}</p>
                    <textarea id="description" v-model="form.description" rows="5" cols="33"></textarea>
                </fieldset>

                <label>Tags <span style="color: red">*</span></label>
                <div v-if="selectedTags.some(tag => !tag.isValid)">
                    <ul style="margin-bottom: 1rem;">
                        <li v-for="tag in selectedTags.filter(tag => !tag.isValid)" :key="tag.id"
                            class="validation-message">
                            {{ tag.name }} — {{ tag.refusalReason }}
                        </li>
                    </ul>
                </div>
                <div class="dropdown" :class="{ open: isDropdownOpen }" ref="dropdownRef">
                    <div class="dropdown-toggle" @click="toggleDropdown">
                        <div class="selected-tags-container">
                            <span v-for="(tag, index) in selectedTags" :key="index"
                                :class="{ 'selected-valid-tag': tag.isValid, 'selected-invalid-tag': !tag.isValid }"
                                @click="handleSelectedTagClick(tag, $event)">
                                {{ tag.name }}
                            </span>
                            <span class="dropdown-placeholder" v-if="selectedTags.length === 0">
                                {{ $t('update.label_tags') }}
                            </span>
                        </div>
                    </div>
                    <div v-if="isDropdownOpen" class="dropdown-content">
                        <div class="tags-list">
                            <label v-for="(tag, index) in tags" :key="tag.id" class="tag-item" :class="{
                                'not-selected-valid': !selectedTags.some(t => t.id === tag.id) && tag.isValid,
                                'not-selected-invalid': !selectedTags.some(t => t.id === tag.id) && !tag.isValid,
                                'selected-valid': selectedTags.some(t => t.id === tag.id) && tag.isValid,
                                'selected-invalid': selectedTags.some(t => t.id === tag.id) && !tag.isValid
                            }">
                                <input type="checkbox" :value="tag" :checked="selectedTags.some(t => t.id === tag.id)"
                                    @change="toggleTag(tag)" />
                                {{ tag.name }}
                            </label>
                        </div>
                        <div class="add-tag-container">
                            <label for="new-tag">{{ $t('update.new_tag') }}</label>
                            <div class="add-tag">
                                <input id="new-tag" type="text" :placeholder="$t('update.placeholder_tag')"
                                    v-model="newTag" @keyup.enter="addTag" class="new-tag-input" />
                                <button @click="addTag" type="button" class="add-tag-button">{{ $t('update.add_button')
                                }}</button>
                            </div>
                        </div>
                    </div>
                </div>

                <p v-if="!refusalReasons.videoFile.isValid" class="validation-message">{{
                    refusalReasons.videoFile.value }}</p>
                <p v-if="!refusalReasons.videoContent.isValid" class="validation-message">{{
                    refusalReasons.videoContent.value }}</p>
                <p v-if="!refusalReasons.preview.isValid" class="validation-message">{{
                    refusalReasons.preview.value }}</p>
                <FadeSlideTransition>
                    <component :is="componentToShow" v-model="form.urlYoutube" :mode="'update'"
                        :imagePreview="imagePreview" @update:videoThumbnail="updateVideoThumbnail"
                        :videoThumbnail="videoThumbnail" @update:imagePreview="updateImagePreview"
                        :videoPreview="videoPreview" @update:videoPreview="updateVideoPreview"
                        @update:selectedFile="updateSelectedFile" />
                </FadeSlideTransition>
                <p v-if="selectedTags.length === 0" class="comment-info">{{ $t('update.tag_required') }}</p>
                <p v-if="overallReasonForRefusal" class="validation-message">{{ overallReasonForRefusal }}
                </p>
                <button type="submit"
                    :disabled="!isFormValid || selectedTags.length === 0 || isDropdownOpen || navbarStore.isMenuOpen">
                    {{ $t('update.submit_button') }}
                </button>
            </form>
        </div>
    </div>
    <el-button @click="showConfirmDialog" :disabled="isDropdownOpen || navbarStore.isMenuOpen">
                {{ $t('update.delete') }}
            </el-button>
    <notifications position="bottom right" />
</template>



<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from 'vue-router';
import url from '@/utils/url';
import axios from 'axios';
import { useAuthStore } from "@/stores/auth";
import UrlYoutubeFieldset from "./UrlYoutubeFieldset.vue";
import ImageSelector from "./ImageSelector.vue";
import VideoSelector from "./VideoSelector.vue";
import FadeSlideTransition from "@/transitions/FadeSlideTransition.vue";
import { useNavbarStore } from "../stores/navbar";
import { useNotification } from "@kyvg/vue3-notification";
import extractVideoId from "@/utils/extractYoutubeUrl";
import { useI18n } from "vue-i18n";
import { ElMessageBox } from 'element-plus';

const route = useRoute();
const articleId = route.params.id;
const authStore = useAuthStore();
const navbarStore = useNavbarStore();
const router = useRouter();
const { notify } = useNotification();
const { t } = useI18n();

const mediaType = ref("youtube");
const state = ref("loading");
const tags = ref([]);
const selectedTags = ref([]);
const refusalReasons = ref({
    title: { isValid: true, value: "" },
    description: { isValid: true, value: "" },
    preview: { isValid: true, value: "" },
    videoContent: { isValid: true, value: "" },
    videoFile: { isValid: true, value: "" }
});;
const overallReasonForRefusal = ref(null);
const selectedFile = ref(null);
const imagePreview = ref(null);
const videoPreview = ref(null);
const videoThumbnail = ref(null);
const isDropdownOpen = ref(false);
const isClosingNavbar = ref(false);
const isConfirmedDelete = ref(false);
const isDialogVisible = ref(false);
const dropdownRef = ref(null);
const newTag = ref("");

const form = ref({
    title: "",
    description: "",
    urlYoutube: ""
});

const isFormValid = computed(() => {
    if (!form.value.title || !form.value.description) return false;

    switch (mediaType.value) {
        case "youtube":
            return form.value.urlYoutube.length > 0;
        case "image":
        case "video":
            return selectedFile.value !== null;
        default:
            return false;
    }
});

const handleSelectedTagClick = (tag, event) => {
    // Empêche la fermeture du dropdown si clic dans la sélection
    event.stopPropagation();

    // Ne fait rien si le dropdown est fermé
    if (!isDropdownOpen.value) return;

    // Si le tag est présent, on le retire
    const index = selectedTags.value.findIndex(t => t.name === tag.name);
    if (index !== -1) {
        selectedTags.value.splice(index, 1);
    }
};

const toggleTag = (tag) => {
    const index = selectedTags.value.findIndex(t => t.id === tag.id);
    if (index !== -1) {
        selectedTags.value.splice(index, 1);
    } else {
        selectedTags.value.push(tag);
    }
};

const componentToShow = computed(() => {
    if (mediaType.value === "youtube") return UrlYoutubeFieldset;
    if (mediaType.value === "video") return VideoSelector;
    return ImageSelector;
});

const updateSelectedFile = (file) => {
    selectedFile.value = file;
    const fileName = file?.name.length > 0 ? file?.name : "Aucun fichier choisi";
    document.querySelector('.custom-label').textContent = fileName;
};

const updateImagePreview = (preview) => {
    imagePreview.value = preview;
};

const updateVideoPreview = (video) => {
    videoPreview.value = video;
};

const updateVideoThumbnail = (thumbnail) => {
    videoThumbnail.value = thumbnail;
};

const fetchArticle = async () => {
    axios(`${url.baseUrl}/api/v1/articles/${articleId}`, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    })
        .then((response) => {
            const article = response.data.article
            if (article.video) mediaType.value = 'video'
            if (article.preview) mediaType.value = 'image'
            if (article.urlYoutube) mediaType.value = 'youtube'
            refusalReasons.value = JSON.parse(article.refusalReasons)
            overallReasonForRefusal.value = article.overallReasonForRefusal
            selectedTags.value = article.tags;

            if (mediaType.value === 'youtube') {
                form.value = {
                    title: article.title,
                    description: article.description,
                    urlYoutube: article.urlYoutube,
                    tags: article.tags
                };
            } else if (mediaType.value === 'image') {
                imagePreview.value = `${article.preview}`;
                form.value = {
                    title: article.title,
                    description: article.description,
                    preview: article.preview,
                    tags: article.tags
                };
            } else if (mediaType.value === 'video') {
                form.value = {
                    title: article.title,
                    description: article.description,
                    video: article.video,
                    tags: article.tags
                };
                if (mediaType.value === 'video' && article.video) {
                    videoPreview.value = `${article.video}`;
                    videoThumbnail.value = `${article.thumbnail}`;
                }
            }
        })
        .catch((error) => {
            notify({
                title: "Fetching Article",
                type: 'error',
                text: error.response.data.message,
            });
            state.value = "error";
        });

};

onMounted(() => {
    window.scrollTo(0, 0);
    fetchArticle();
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

const handleSubmit = async () => {
    state.value = 'loading';

    if ((!selectedFile.value && mediaType !== 'youtube') || (!form.value.urlYoutube && mediaType === 'youtube')) {
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

    formData.append("title", form.value.title);
    formData.append("description", form.value.description);
    if (mediaType.value === "youtube") {
        // Verify youtube ID is valid
        const isValidYoutubeId = extractVideoId(form.value.urlYoutube ?? '')

        if (!isValidYoutubeId) {
            notify({
                title: t('notification.title.field_media_required'),
                type: 'warn',
                text: t('notification.text.field_media_url'),
            });
        }
        if (isValidYoutubeId) {
            formData.append("urlYoutube", form.value.urlYoutube);
        } else {
            return
        }
    } else if (mediaType.value === "image") {
        formData.append("preview", selectedFile.value)
    } else if (mediaType.value === "video") {
        formData.append("video", selectedFile.value)
    }
    formData.append("userId", authStore.user.id);
    formData.append("tags", JSON.stringify(cleanedTags));

    axios
        .put(`${url.baseUrl}/api/v1/articles/${route.params.id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        .then(() => {
            notify({
                title: t('notification.title.article_update'),
                type: 'success',
                text: t('notification.text.article_update'),
            });
            setTimeout(() => {
                // Improve it by call after navigation ...
                state.value = 'idle';
                router.push("/articles");
            }, 2000);
        })
        .catch((error) => {
            notify({
                title: t('notification.title.article_update'),
                type: 'error',
                text: error.response.data.message,
            });
            state.value = 'error';
        });


};

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

const toggleDropdown = () => {
    if (isClosingNavbar.value) {
        return;
    }

    isDropdownOpen.value = !isDropdownOpen.value;
};

const showConfirmDialog = () => {
    ElMessageBox.confirm(
        t('update.delete_warning') + t('update.delete_answer'),
        t('update.delete_title'),

        {
            confirmButtonText: t('navigation.yes'),
            cancelButtonText: t('navigation.no'),
            type: 'warning',
            center: true,
        }
    )
        .then(() => {
            confirmDelete()
        })
        .catch(() => {
            // annulé
        })
}

const confirmDelete = () => {
    isConfirmedDelete.value = true;
    isDialogVisible.value = false;
    deleteArticle();
};

const deleteArticle = async (id) => {
    if (isConfirmedDelete) {
        try {
            const response = await axios.delete(`${url.baseUrl}/api/v1/articles/${route.params.id}`, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${authStore.token}`,
                },
                withCredentials: true
            })

            notify({
                title: t('notification.title.delete_article'),
                type: 'success',
                text: response.data.message,
            });

            setTimeout(() => {
                router.push(`/profile/${authStore.user.pseudo}`)
            }, 3000)

        } catch (error) {
            console.log("error: ", error)
            notify({
            title: t('notification.title.delete_article'),
            type: 'error',
            text: error.response?.data?.message || 'Delete failed.',
        });
        }
    }
};
</script>

<style scoped>
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
    z-index: 1;
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

.validation-message {
    font-weight: bold;
    color: red;
    font-size: clamp(0.65rem, 1.5vw, 0.75rem);
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
    cursor: pointer;
    display: inline-block;
    font-size: 12px;
    box-sizing: border-box;
    transition: background-color 0.3s, color 0.3s;
}

.selected-valid {
    background-color: #6400e4;
    color: white;
    border: 2px solid #6400e4;
}

.selected-invalid {
    background-color: #e4a100;
    color: white;
    border: 2px solid #c98d01;
}

.not-selected-valid {
    border: 2px solid #6400e4;
}

.not-selected-invalid {
    border: 2px solid #c98d01;
}

.selected-valid-tag {
    padding: 4px 8px;
    background-color: #6400e4;
    color: white;
    border-radius: 12px;
    font-size: 12px;
    margin: 0 4px 4px 0;
    z-index: 4;
}

.selected-invalid-tag {
    padding: 4px 8px;
    background-color: #e4a100;
    color: white;
    border-radius: 12px;
    font-size: 12px;
    margin: 0 4px 4px 0;
    z-index: 4;
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

.el-button {
    border-color: #ff4d4d;
    color: red;
}

.el-button:hover {
    background-color: #ff4d4d77;
    border-color: #ff4d4d;
    color: red;
}
</style>
