<template>
    <div class="container pico">
        <div v-if="state === 'error'">
            <p>Impossible de charger cet article</p>
        </div>
        <div v-else-if="state === 'loading'">
            <p>Chargement de l'article...</p>
        </div>
        <div v-else class="article-container">
            <div v-if="isMobile">
                <!-- Mobile View -->
                <h3>Validation des tags</h3>
                <div v-for="tag in article.tags" :key="tag.id" class="tag-container">
                    <div class="tag-row">
                        <span class="tag-name">{{ tag.name }}</span>
                        <div class="tag-actions">
                            <span :class="{ validated: tag.isValid }" @click="accept(tag, 'tag')" class="mobile-icon-tag">
                                <CheckIcon class="icon-check" />
                            </span>
                            <span :class="{ refused: tag.isValid === false }" @click="refuse(tag, 'tag')" class="mobile-icon-tag">
                                <CrossIcon class="icon-cross" />
                            </span>
                        </div>
                        <textarea :disabled="tag.isValid" v-model="tag.refusalReason"
                            placeholder="Motif du refus du tag"></textarea>
                        <button :disabled="navbarStore.isMenuOpen" @click="updateTag(tag)">Update</button>
                    </div>
                </div>

                <h3>Validation des champs de l'article</h3>
                <div class="field">
                    <label>Titre: </label>
                    <span>{{ article.title }}</span>
                </div>
                <div class="group">
                    <div class="field-row">
                        <div class="icon-fields-mobile" :class="{ validated: article.refusalReasons.title.isValid }"
                            @click="accept(article, 'title')">
                            <CheckIcon />
                        </div>
                        <div class="icon-fields-mobile" :class="{ refused: article.refusalReasons.title.isValid === false }"
                            @click="refuse(article, 'title')">
                            <CrossIcon />
                        </div>
                        <textarea :disabled="article.refusalReasons.title.isValid"
                            v-model="article.refusalReasons.title.value"
                            placeholder="Motif du refus du titre"></textarea>
                    </div>
                </div>

                <hr />

                <div v-if="article.urlYoutube">
                    <div class="field">
                        <label>Vidéo: </label>
                    </div>
                    <div class="player">
                        <Player :videoId="extractYoutubeUrl(article.urlYoutube)" />
                    </div>
                    <div class="group">
                        <div class="field-row">
                            <div class="icon-fields-mobile" :class="{ validated: article.refusalReasons.videoContent.isValid }"
                                @click="accept(article, 'videoContent')">
                                <CheckIcon />
                            </div>
                            <div class="icon-fields-mobile"
                                :class="{ refused: article.refusalReasons.videoContent.isValid === false }"
                                @click="refuse(article, 'videoContent')">
                                <CrossIcon />
                            </div>
                            <textarea :disabled="article.refusalReasons.videoContent.isValid"
                                v-model="article.refusalReasons.videoContent.value"
                                placeholder="Motif du refus de la vidéo"></textarea>
                        </div>
                    </div>
                </div>
                <div v-else-if="article.preview">
                    <div class="field">
                        <label>Preview: </label>
                    </div>
                    <img :src="`${url.baseUrl}:${url.portBack}/${article.preview}`" alt="Preview" />
                    <div class="group">
                        <div class="field-row">
                            <div class="icon-fields-mobile" :class="{ validated: article.refusalReasons.preview.isValid }"
                                @click="accept(article, 'preview')">
                                <CheckIcon />
                            </div>
                            <div class="icon-fields-mobile"
                                :class="{ refused: article.refusalReasons.preview.isValid === false }"
                                @click="refuse(article, 'preview')">
                                <CrossIcon />
                            </div>
                            <textarea :disabled="article.refusalReasons.preview.isValid"
                                v-model="article.refusalReasons.preview.value"
                                placeholder="Motif du refus de l'image"></textarea>
                        </div>
                    </div>
                </div>

                <hr />

                <div class="field">
                    <label>Description: </label>
                    <span>{{ article.description }}</span>
                </div>
                <div class="group">
                    <div class="field-row">
                        <div class="icon-fields-mobile" :class="{ validated: article.refusalReasons.description.isValid }"
                            @click="accept(article, 'description')">
                            <CheckIcon />
                        </div>
                        <div class="icon-fields-mobile"
                            :class="{ refused: article.refusalReasons.description.isValid === false }"
                            @click="refuse(article, 'description')">
                            <CrossIcon />
                        </div>
                        <textarea :disabled="article.refusalReasons.description.isValid"
                            v-model="article.refusalReasons.description.value"
                            placeholder="Motif du refus de la description"></textarea>
                    </div>
                </div>

                <h3>Validation générale de l'article</h3>
                <div class="group">
                    <div class="field-row">
                        <div class="icon-fields-mobile" :class="{ validated: article.isValid }"
                            @click="accept(article, 'overall')">
                            <CheckIcon />
                        </div>
                        <div class="icon-fields-mobile" :class="{ refused: article.isValid === false }"
                            @click="refuse(article, 'overall')">
                            <CrossIcon />
                        </div>
                        <textarea :disabled="article.isValid" v-model="article.overallReasonForRefusal"
                            placeholder="Motif du refus de l'article" class="final-textarea"></textarea>
                        <button :disabled="navbarStore.isMenuOpen" @click="updateArticle(article)">Update</button>
                    </div>
                </div>
            </div>

            <div v-else>
                <!-- PC View -->
                <h3>Validation des tags</h3>
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Tag</th>
                            <th scope="col">Valider</th>
                            <th scope="col">Refuser</th>
                            <th scope="col">Raison</th>
                            <th scope="col">Sauvegarder</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="tag in article.tags" :key="tag.id">
                            <th scope="row">{{ tag.name }}</th>
                            <td class="icon-tag" :class="{ validated: tag.isValid }" @click="accept(tag, 'tag')">
                                <CheckIcon class="icon-check" />
                            </td>
                            <td class="icon-tag" :class="{ refused: tag.isValid === false }" @click="refuse(tag, 'tag')">
                                <CrossIcon class="icon-cross" />
                            </td>


                            <td><textarea :disabled="tag.isValid" v-model="tag.refusalReason"
                                    placeholder="Motif du refus du tag"></textarea>
                            </td>
                            <td class="tag-submit"><button @click="updateTag(tag)">Update</button></td>
                        </tr>
                    </tbody>
                </table>

                <h3>Validation des champs de l'article</h3>
                <div class="field">
                    <label>Titre: </label>
                    <span>{{ article.title }}</span>
                </div>
                <div class="group">
                    <table class="table-fields">
                        <thead>
                            <tr>
                                <th scope="col">Valider</th>
                                <th scope="col">Refuser</th>
                                <th scope="col">Raison</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="icon-fields" :class="{ validated: article.refusalReasons.title.isValid }"
                                    @click="accept(article, 'title')">
                                    <CheckIcon />
                                </td>
                                <td class="icon-fields" :class="{ refused: article.refusalReasons.title.isValid === false }"
                                    @click="refuse(article, 'title')">
                                    <CrossIcon />
                                </td>
                                <td>
                                    <textarea :disabled="article.refusalReasons.title.isValid"
                                        v-model="article.refusalReasons.title.value"
                                        placeholder="Motif du refus du titre"></textarea>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr />

                <div v-if="article.urlYoutube">
                    <div class="field">
                        <label>Vidéo: </label>
                    </div>
                    <div class="player">
                        <Player :videoId="extractYoutubeUrl(article.urlYoutube)" />
                    </div>
                    <div class="group">
                        <table class="table-fields">
                            <thead>
                                <tr>
                                    <th scope="col">Valider</th>
                                    <th scope="col">Refuser</th>
                                    <th scope="col">Raison</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="icon-fields"
                                        :class="{ validated: article.refusalReasons.videoContent.isValid }"
                                        @click="accept(article, 'videoContent')">
                                        <CheckIcon />
                                    </td>
                                    <td class="icon-fields"
                                        :class="{ refused: article.refusalReasons.videoContent.isValid === false }"
                                        @click="refuse(article, 'videoContent')">
                                        <CrossIcon />
                                    </td>
                                    <td>
                                        <textarea :disabled="article.refusalReasons.videoContent.isValid"
                                            v-model="article.refusalReasons.videoContent.value"
                                            placeholder="Motif du refus de la vidéo"></textarea>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-else-if="article.preview">
                    <div class="field">
                        <label>Preview: </label>
                    </div>
                    <img :src="`${url.baseUrl}:${url.portBack}/${article.preview}`" alt="Preview" />
                    <div class="group">
                        <table class="table-fields">
                            <thead>
                                <tr>
                                    <th scope="col">Valider</th>
                                    <th scope="col">Refuser</th>
                                    <th scope="col">Raison</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="icon-fields" :class="{ validated: article.refusalReasons.preview.isValid }"
                                        @click="accept(article, 'preview')">
                                        <CheckIcon />
                                    </td>
                                    <td class="icon-fields"
                                        :class="{ refused: article.refusalReasons.preview.isValid === false }"
                                        @click="refuse(article, 'preview')">
                                        <CrossIcon />
                                    </td>
                                    <td>
                                        <textarea :disabled="article.refusalReasons.preview.isValid"
                                            v-model="article.refusalReasons.preview.value"
                                            placeholder="Motif du refus de l'image"></textarea>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <hr />

                <div class="field">
                    <label>Description: </label>
                    <span>{{ article.description }}</span>
                </div>
                <div class="group">
                    <table class="table-fields">
                        <thead>
                            <tr>
                                <th scope="col">Valider</th>
                                <th scope="col">Refuser</th>
                                <th scope="col">Raison</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="icon-fields" :class="{ validated: article.refusalReasons.description.isValid }"
                                    @click="accept(article, 'description')">
                                    <CheckIcon />
                                </td>
                                <td class="icon-fields"
                                    :class="{ refused: article.refusalReasons.description.isValid === false }"
                                    @click="refuse(article, 'description')">
                                    <CrossIcon />
                                </td>
                                <td>
                                    <textarea :disabled="article.refusalReasons.description.isValid"
                                        v-model="article.refusalReasons.description.value"
                                        placeholder="Motif du refus de la description"></textarea>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>


                <h3>Validation générale de l'article</h3>
                <div class="group">
                    <table class="table-fields">
                        <thead>
                            <tr>
                                <th scope="col">Valider</th>
                                <th scope="col">Refuser</th>
                                <th scope="col">Raison</th>
                                <th scope="col">Sauvegarder</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="icon-fields" :class="{ validated: article.isValid }"
                                    @click="accept(article, 'overall')">
                                    <CheckIcon />
                                </td>
                                <td class="icon-fields" :class="{ refused: article.isValid === false }"
                                    @click="refuse(article, 'overall')">
                                    <CrossIcon />
                                </td>
                                <td>
                                    <textarea :disabled="article.isValid" v-model="article.overallReasonForRefusal"
                                        placeholder="Motif du refus de l'article" class="final-textarea">
                                    </textarea>
                                </td>
                                <td class="final-submit">
                                    <button @click="updateArticle(article)">Update</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <notifications position="bottom right" />
</template>

<script setup>
import axios from "axios";
import { onMounted, ref, onBeforeUnmount, nextTick } from "vue";
import { useRoute } from "vue-router";
import extractYoutubeUrl from "../utils/extractYoutubeUrl";
import Player from "./Player.vue";
import url from "../utils/url";
import { useAuthStore } from "@/stores/auth";
import CheckIcon from "./icons/CheckIcon.vue";
import CrossIcon from "./icons/CrossIcon.vue";
import { useNavbarStore } from "../stores/navbar";
import { useNavbarHandler } from "../composables/useNavbarHandler";
import { useNotification } from "@kyvg/vue3-notification";


const isMobile = ref(false);
const article = ref(null);
const state = ref("loading");
const route = useRoute();
const authStore = useAuthStore();
const tags = ref([]);
const navbarStore = useNavbarStore();
const { handleNavbar } = useNavbarHandler();
const { notify } = useNotification();

const checkWindowSize = () => {
    if (window.innerWidth <= 768) {
        isMobile.value = true;
    } else {
        isMobile.value = false;
    }
};

const accept = (item, entity) => {
    handleNavbar(() => {
        if (entity === 'tag') {
            item.refusalReason = "";
            item.isValid = true;
        } else if (entity === 'title') {
            item.refusalReasons.title.value = "";
            item.refusalReasons.title.isValid = true;
        } else if (entity === 'videoContent') {
            item.refusalReasons.videoContent.value = "";
            item.refusalReasons.videoContent.isValid = true;
        } else if (entity === 'preview') {
            item.refusalReasons.preview.value = "";
            item.refusalReasons.preview.isValid = true;
        } else if (entity === 'description') {
            item.refusalReasons.description.value = "";
            item.refusalReasons.description.isValid = true;
        } else if (entity === 'overall') {
            let canValidate = true;

            //Verify tags validations before validate article
            for (let i = 0; i < article.value.tags.length; i++) {
                if (!article.value.tags[i].isValid) {
                    notify({
                        title: "Validation",
                        type: 'warn',
                        text: 'Some tag(s) not validated',
                    });
                    canValidate = false
                }
            }

            //Verify fields validations before validate article
            if (article.value.preview === null) {
                if (
                    !item.refusalReasons.title.isValid ||
                    !item.refusalReasons.videoContent.isValid ||
                    !item.refusalReasons.description.isValid
                ) {
                    notify({
                        title: "Validation",
                        type: 'warn',
                        text: 'Some field(s) not validated',
                    });
                    canValidate = false
                }
            } else if (article.value.urlYoutube === null) {
                if (
                    !item.refusalReasons.title.isValid ||
                    !item.refusalReasons.preview.isValid ||
                    !item.refusalReasons.description.isValid
                ) {
                    notify({
                        title: "Validation",
                        type: 'warn',
                        text: 'Some field(s) not validated',
                    });
                    canValidate = false
                }
            }
            //Finaly can validate article if all validations are true
            if (canValidate) {
                item.overallReasonForRefusal = "";
                item.isValid = true;
            }
        }
    })
    
}

const refuse = (item, entity) => {
    handleNavbar(() => {
        if (entity === 'tag') {
            item.isValid = false;
        } else if (entity === 'title') {
            item.refusalReasons.title.isValid = false;
        } else if (entity === 'videoContent') {
            item.refusalReasons.videoContent.isValid = false;
        } else if (entity === 'preview') {
            item.refusalReasons.preview.isValid = false;
        } else if (entity === 'description') {
            item.refusalReasons.description.isValid = false;
        } else if (entity === 'overall') {
            item.isValid = false
        }
    })
}

const updateTag = (tag) => {
    handleNavbar(() => {
        const updatedTag = {
            id: tag.id,
            isValid: tag.isValid,
            refusalReason: tag.refusalReason,
            validatedBy: authStore.user?.id
        };

        axios.put(`${url.baseUrl}:${url.portBack}/api/v1/tags/${tag.id}/validate`, updatedTag, {
            withCredentials: true,
        }).then(response => {
            notify({
                title: "Validation",
                type: 'success',
                text: 'Tag validated successfully !',
            });
        }).catch(error => {
            notify({
                title: "Validation",
                type: 'error',
                text: `Error updating tag validation: ${error.response.data.message}`,
            });
        });
    })  
};

const updateArticle = (article) => {
    handleNavbar(() => {
        const updatedArticle = {
            id: article.id,
            tags: article.tags,
            refusalReasons: JSON.stringify({
                title: {
                    value: article.refusalReasons.title.value,
                    isValid: article.refusalReasons.title.isValid,
                    validatedBy: authStore.user?.id
                },
                description: {
                    value: article.refusalReasons.description.value,
                    isValid: article.refusalReasons.description.isValid,
                    validatedBy: authStore.user?.id
                },
                preview: {
                    value: article.refusalReasons.preview.value,
                    isValid: article.refusalReasons.preview.isValid,
                    validatedBy: authStore.user?.id
                },
                videoContent: {
                    value: article.refusalReasons.videoContent.value,
                    isValid: article.refusalReasons.videoContent.isValid,
                    validatedBy: authStore.user?.id
                }
            }),
            overallReasonForRefusal: article.overallReasonForRefusal,
            isValid: article.isValid,
            validatedBy: authStore.user?.id
        };

        axios.put(`${url.baseUrl}:${url.portBack}/api/v1/articles/${article.id}/validate`, updatedArticle, {
            withCredentials: true,
        }).then(response => {
            notify({
                title: "Validation",
                type: 'success',
                text: 'Article validated successfully !',
            });
        }).catch(error => {
            notify({
                title: "Validation",
                type: 'error',
                text: `Error updating article validation: ${error.response.data.message}`,
            });
        });
    })
};

onMounted(() => {
    checkWindowSize();

    window.addEventListener('resize', () => {
        checkWindowSize();
    });


    const articleId = route.params.id;

    axios.get(`${url.baseUrl}:${url.portBack}/api/v1/articles/${articleId}`, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    })
        .then((response) => {
            if (response.data && response.data.article) {
                const fetchedArticle = response.data.article;
                if (fetchedArticle.refusalReasons && typeof fetchedArticle.refusalReasons === "string") {
                    try {
                        fetchedArticle.refusalReasons = JSON.parse(fetchedArticle.refusalReasons);
                    } catch (e) {
                        notify({
                            title: "Fetching Article",
                            type: 'error',
                            text: `Error parsing refusalReasons: ${e.message}`,
                        });
                        fetchedArticle.refusalReasons = {};
                    }
                    article.value = fetchedArticle;
                    tags.value = fetchedArticle.tags;
                    state.value = "idle";
                } else {
                    article.value = response.data.article;
                    tags.value = response.data.article.tags;
                    state.value = "idle";
                }
            }
        })
        .catch((error) => {
            notify({
                title: "Fetching Article Awaiting To Validation",
                type: 'error',
                text: `Error fetching article: ${error.response.data.message}`,
            });
            state.value = "error";
        })
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', checkWindowSize);
});
</script>

<style>
.field {
    display: flex;
    justify-content: center;
    text-align: center !important;
    align-items: center !important;
    font-size: 20px;
    margin-bottom: 10px;
}

fieldset {
    margin-bottom: 0px 25px;
}

fieldset legend label {
    margin-bottom: 0px !important;
}

.field span {
    font-weight: normal;
}

label {
    margin-right: 15px;
}

.player {
    margin-bottom: 15px;
}

.icon-check {
    cursor: pointer;
    font-size: 41px;
}

.icon-cross {
    cursor: pointer;
    font-size: 48px;
}

td.icon-tag {
    text-align: center;
}

.group {
    display: flex;
    justify-content: center;
}

.group-final {
    display: flex;
    justify-content: center;
    height: 100px;
}

.icon-fields {
    cursor: pointer;
    width: 60px !important;
    font-size: 40px;
}

td.icon-fields {
    text-align: center;
}

table {
    width: 100%;
    border-collapse: collapse;
}

.table-fields {
    width: 50%;
    border-collapse: collapse;
}

th {
    cursor: default;
}

th,
td {
    text-align: center;
    vertical-align: middle;
    padding: 6px !important;
    border: 1px solid #ddd;
    height: 115px !important;
}

thead th {
    background-color: #f4f4f4;
    font-weight: bold;
}

tbody tr:hover {
    background-color: #f9f9f9;
}

td input,
td textarea,
fieldset input,
fieldset textarea {
    width: 100%;
    min-width: 200px;
    padding: 8px !important;
    font-size: 14px !important;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: none;
}

.final-textarea {
    resize: vertical !important;
    min-height: 80px;
}

td.validated {
    background-color: green;
}

td.refused {
    background-color: crimson;
}

td button {
    font-size: 14px !important;
    padding: 6px !important;
    color: white !important;
}


/* mobile style */
.field,
.group {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
}

.tag-container {
    margin-bottom: 15px;
}

.tag-row {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.tag-name {
    font-size: 16px;
    font-weight: bold;
}

.tag-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.icon {
    cursor: pointer;
}

textarea {
    width: 100%;
    min-width: 180px;
    padding: 8px !important;
    font-size: 14px !important;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: none;
    margin-bottom: 10px;
}

.final-submit, .tag-submit {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 115px !important;
}

.final-submit button {
    height: 35px;
}

.final-textarea {
    resize: vertical !important;
    min-height: 80px;
}

.icon-fields-mobile {
    cursor: pointer;
    width: 60px !important;
    font-size: 30px;
    text-align: center;
    border: 1px solid grey;
    margin-bottom: 2px;
    border-radius: 10px;
}

.mobile-icon-tag {
    cursor: pointer;
    width: 60px !important;
    font-size: 30px;
    text-align: center;
    border: 1px solid grey;
    margin-bottom: 2px;
    border-radius: 10px;
}

button {
    font-size: 14px;
    padding: 6px;
}

@media (max-width: 768px) {
    h3 {
        text-align: center;
    }

    .tag-row {
        display: block;
        text-align: center;
    }

    .tag-actions {
        flex-direction: column;
        gap: 8px;
    }

    .group {
        flex-direction: column;
        align-items: center;
        margin-bottom: 20px !important;

    }

    textarea {
        font-size: 12px;
        min-width: 150px;
        margin-top: 10px;
    }

    button {
        font-size: 18px;
        padding: 10px;
        margin-bottom: 15px;
    }

    .field-row {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    span.validated, div.validated {
        background-color: green;
    }

    span.refused, div.refused {
        background-color: crimson;
    }
    
}
</style>
