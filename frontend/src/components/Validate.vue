<template>
    <div class="container pico">
        <div v-if="state === 'error'">
            <p>{{ $t('article_detail.state_error') }}</p>
        </div>
        <div v-else-if="state === 'loading'">
            <p>{{ $t('article_detail.state_loading') }}</p>
        </div>
        <div v-else class="article-container">
            <div v-if="isMobile">
                <!-- Mobile View -->
                <h3>{{ $t('validate.title') }}</h3>
                <div v-for="tag in article.tags" :key="tag.id" class="tag-container card">
                    <div class="tag-row">
                        <span class="tag-name">{{ tag.name }}</span>
                        <div class="tag-actions">
                            <div class="action-container-mobile">
                                <span :class="{ validated: tag.isValid }" @click="accept(tag, 'tag')"
                                    class="mobile-icon-tag">
                                    <CheckIcon class="icon-check" />
                                </span>
                                <span :class="{ refused: tag.isValid === false }" @click="refuse(tag, 'tag')"
                                    class="mobile-icon-tag">
                                    <CrossIcon class="icon-cross" />
                                </span>
                            </div>
                        </div>
                        <textarea :disabled="tag.isValid" v-model="tag.refusalReason"
                            placeholder="Motif du refus du tag"></textarea>
                        <div class="tag-actions">
                            <button :disabled="navbarStore.isMenuOpen" @click="updateTag(tag)">{{
                                $t('validate.save_button')
                            }}</button>
                            <button class="delete-button" :disabled="tag.isValid || navbarStore.isMenuOpen"
                                @click="deleteTag(tag)">{{
                                    $t('validate.delete_button')
                                }}</button>
                        </div>
                    </div>

                </div>

                <h3>{{ $t('validate.sub_title') }}</h3>

                <div class="group card">
                    <div class="field">
                        <p>{{ $t('validate.label_title') }}: <span>{{ article.title }}</span></p>
                    </div>
                    <div class="field-row">
                        <div class="action-container-mobile">
                            <div class="icon-fields-mobile" :class="{ validated: article.refusalReasons.title.isValid }"
                                @click="accept(article, 'title')">
                                <CheckIcon />
                            </div>
                            <div class="icon-fields-mobile"
                                :class="{ refused: article.refusalReasons.title.isValid === false }"
                                @click="refuse(article, 'title')">
                                <CrossIcon />
                            </div>
                        </div>
                        <textarea :disabled="article.refusalReasons.title.isValid"
                            v-model="article.refusalReasons.title.value"
                            :placeholder="$t('validate.placeholder_title')"></textarea>
                    </div>
                </div>

                <hr />
                <div v-if="article.video">
                    <div class="group card">
                        <div class="field">
                            <p>{{ $t('validate.label_video') }}: </p>
                        </div>
                        <video controls :src="`${url.baseUrl}/${article.video}`" width="600">
                            <source :src="`${url.baseUrl}/${article.video}`" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <div class="field-row">
                            <div class="action-container-mobile">
                                <div class="icon-fields-mobile"
                                    :class="{ validated: article.refusalReasons.videoFile.isValid }"
                                    @click="accept(article, 'videoFile')">
                                    <CheckIcon />
                                </div>
                                <div class="icon-fields-mobile"
                                    :class="{ refused: article.refusalReasons.videoFile.isValid === false }"
                                    @click="refuse(article, 'videoFile')">
                                    <CrossIcon />
                                </div>
                            </div>
                            <textarea :disabled="article.refusalReasons.videoFile.isValid"
                                v-model="article.refusalReasons.videoFile.value"
                                :placeholder="$t('validate.placeholder_video')"></textarea>
                        </div>
                    </div>
                </div>

                <div v-if="article.urlYoutube">
                    <div class="group card">
                        <div class="field">
                            <p>{{ $t('validate.label_video') }}: </p>
                        </div>
                        <Player :videoId="extractYoutubeUrl(article.urlYoutube)" />

                        <div class="field-row mt20">
                            <div class="action-container-mobile">
                                <div class="icon-fields-mobile"
                                    :class="{ validated: article.refusalReasons.videoContent.isValid }"
                                    @click="accept(article, 'videoContent')">
                                    <CheckIcon />
                                </div>
                                <div class="icon-fields-mobile"
                                    :class="{ refused: article.refusalReasons.videoContent.isValid === false }"
                                    @click="refuse(article, 'videoContent')">
                                    <CrossIcon />
                                </div>
                            </div>
                            <textarea :disabled="article.refusalReasons.videoContent.isValid"
                                v-model="article.refusalReasons.videoContent.value"
                                :placeholder="$t('validate.placeholder_video')"></textarea>
                        </div>
                    </div>
                </div>
                <div v-else-if="article.preview">
                    <div class="group card">
                        <div class="field">
                            <p>{{ $t('validate.label_preview') }}: </p>
                        </div>
                        <img :src="`${url.baseUrl}/${article.preview}`" alt="Preview" />
                        <div class="field-row">
                            <div class="action-container-mobile">
                                <div class="icon-fields-mobile"
                                    :class="{ validated: article.refusalReasons.preview.isValid }"
                                    @click="accept(article, 'preview')">
                                    <CheckIcon />
                                </div>
                                <div class="icon-fields-mobile"
                                    :class="{ refused: article.refusalReasons.preview.isValid === false }"
                                    @click="refuse(article, 'preview')">
                                    <CrossIcon />
                                </div>
                            </div>
                            <textarea :disabled="article.refusalReasons.preview.isValid"
                                v-model="article.refusalReasons.preview.value"
                                :placeholder="$t('validate.placeholder_preview')"></textarea>
                        </div>
                    </div>
                </div>

                <hr />


                <div class="group card">
                    <div class="field">
                        <p>{{ $t('validate.label_description') }}: <span>{{ article.description }}</span></p>
                    </div>
                    <div class="field-row">
                        <div class="action-container-mobile">
                            <div class="icon-fields-mobile"
                                :class="{ validated: article.refusalReasons.description.isValid }"
                                @click="accept(article, 'description')">
                                <CheckIcon />
                            </div>
                            <div class="icon-fields-mobile"
                                :class="{ refused: article.refusalReasons.description.isValid === false }"
                                @click="refuse(article, 'description')">
                                <CrossIcon />
                            </div>
                        </div>
                        <textarea :disabled="article.refusalReasons.description.isValid"
                            v-model="article.refusalReasons.description.value"
                            :placeholder="$t('validate.placeholder_description')"></textarea>
                    </div>
                </div>

                <h3>{{ $t('validate.sub_title_final') }}</h3>
                <div class="group card">
                    <div class="field-row">
                        <div class="action-container-mobile">
                            <div class="icon-fields-mobile" :class="{ validated: article.isValid }"
                                @click="accept(article, 'overall')">
                                <CheckIcon />
                            </div>
                            <div class="icon-fields-mobile" :class="{ refused: article.isValid === false }"
                                @click="refuse(article, 'overall')">
                                <CrossIcon />
                            </div>
                        </div>
                        <textarea :disabled="article.isValid" v-model="article.overallReasonForRefusal"
                            :placeholder="$t('validate.placeholder_final')" class="final-textarea"></textarea>
                        <button :disabled="navbarStore.isMenuOpen" @click="updateArticle(article)">{{
                            $t('validate.save_button') }}</button>
                    </div>
                </div>
            </div>

            <div v-else>
                <!-- PC View -->
                <h3>{{ $t('validate.tags_title') }}</h3>
                <table>
                    <thead>
                        <tr>
                            <th scope="col">{{ $t('validate.th_tag') }}</th>
                            <th scope="col">{{ $t('validate.th_validate') }}</th>
                            <th scope="col">{{ $t('validate.th_refuse') }}</th>
                            <th scope="col">{{ $t('validate.th_reason') }}</th>
                            <th scope="col">{{ $t('validate.th_save') }}</th>
                            <th scope="col">{{ $t('validate.delete_button') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="tag in article.tags" :key="tag.id">
                            <th scope="row">{{ tag.name }}</th>
                            <td class="icon-tag" :class="{ validated: tag.isValid }" @click="accept(tag, 'tag')">
                                <CheckIcon class="icon-check" />
                            </td>
                            <td class="icon-tag" :class="{ refused: tag.isValid === false }"
                                @click="refuse(tag, 'tag')">
                                <CrossIcon class="icon-cross" />
                            </td>


                            <td><textarea :disabled="tag.isValid" v-model="tag.refusalReason"
                                    :placeholder="$t('validate.placeholder_tags')"></textarea>
                            </td>
                            <td class="tag-submit"><button :disabled="navbarStore.isMenuOpen" @click="updateTag(tag)">{{
                                $t('validate.save_button')
                                    }}</button></td>
                            <td><button class="delete-button" :disabled="tag.isValid || navbarStore.isMenuOpen"
                                    @click="deleteTag(tag)">{{ $t('validate.delete_button')
                                    }}</button></td>
                        </tr>
                    </tbody>
                </table>

                <h3>{{ $t('validate.sub_title') }}</h3>
                <div class="field">
                    <label>{{ $t('validate.label_title') }}: </label>
                    <span>{{ article.title }}</span>
                </div>
                <div class="group">
                    <table class="table-fields">
                        <thead>
                            <tr>
                                <th scope="col">{{ $t('validate.th_validate') }}</th>
                                <th scope="col">{{ $t('validate.th_refuse') }}</th>
                                <th scope="col">{{ $t('validate.th_reason') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="icon-fields" :class="{ validated: article.refusalReasons.title.isValid }"
                                    @click="accept(article, 'title')">
                                    <CheckIcon />
                                </td>
                                <td class="icon-fields"
                                    :class="{ refused: article.refusalReasons.title.isValid === false }"
                                    @click="refuse(article, 'title')">
                                    <CrossIcon />
                                </td>
                                <td>
                                    <textarea :disabled="article.refusalReasons.title.isValid"
                                        v-model="article.refusalReasons.title.value"
                                        :placeholder="$t('validate.placeholder_title')"></textarea>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr />

                <div v-if="article.urlYoutube">
                    <div class="field">
                        <label>{{ $t('validate.label_video') }}: </label>
                    </div>
                    <div class="preview-container">
                        <Player :videoId="extractYoutubeUrl(article.urlYoutube)" />
                    </div>
                    <div class="group">
                        <table class="table-fields">
                            <thead>
                                <tr>
                                    <th scope="col">{{ $t('validate.th_validate') }}</th>
                                    <th scope="col">{{ $t('validate.th_refuse') }}</th>
                                    <th scope="col">{{ $t('validate.th_reason') }}</th>
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
                                            :placeholder="$t('validate.placeholder_video')"></textarea>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-if="article.video">
                    <div class="field">
                        <label>{{ $t('validate.label_video') }}: </label>
                    </div>
                    <div class="preview-container">
                        <video controls :src="`${url.baseUrl}/${article.video}`" width="600">
                            <source :src="`${url.baseUrl}/${article.video}`" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div class="group">
                        <table class="table-fields">
                            <thead>
                                <tr>
                                    <th scope="col">{{ $t('validate.th_validate') }}</th>
                                    <th scope="col">{{ $t('validate.th_refuse') }}</th>
                                    <th scope="col">{{ $t('validate.th_reason') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="icon-fields"
                                        :class="{ validated: article.refusalReasons.videoFile.isValid }"
                                        @click="accept(article, 'videoFile')">
                                        <CheckIcon />
                                    </td>
                                    <td class="icon-fields"
                                        :class="{ refused: article.refusalReasons.videoFile.isValid === false }"
                                        @click="refuse(article, 'videoFile')">
                                        <CrossIcon />
                                    </td>
                                    <td>
                                        <textarea :disabled="article.refusalReasons.videoFile.isValid"
                                            v-model="article.refusalReasons.videoFile.value"
                                            :placeholder="$t('validate.placeholder_video')"></textarea>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-else-if="article.preview">
                    <div class="field">
                        <label>{{ $t('validate.label_preview') }}: </label>
                    </div>
                    <div class="preview-container">
                        <img :src="`${url.baseUrl}/${article.preview}`" alt="Preview" />
                    </div>
                    <div class="group">
                        <table class="table-fields">
                            <thead>
                                <tr>
                                    <th scope="col">{{ $t('validate.th_validate') }}</th>
                                    <th scope="col">{{ $t('validate.th_refuse') }}</th>
                                    <th scope="col">{{ $t('validate.th_reason') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="icon-fields"
                                        :class="{ validated: article.refusalReasons.preview.isValid }"
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
                                            :placeholder="$t('validate.placeholder_preview')"></textarea>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <hr />

                <div class="field">
                    <label>{{ $t('validate.label_description') }}: </label>
                    <span>{{ article.description }}</span>
                </div>
                <div class="group">
                    <table class="table-fields">
                        <thead>
                            <tr>
                                <th scope="col">{{ $t('validate.th_validate') }}</th>
                                <th scope="col">{{ $t('validate.th_refuse') }}</th>
                                <th scope="col">{{ $t('validate.th_reason') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="icon-fields"
                                    :class="{ validated: article.refusalReasons.description.isValid }"
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
                                        :placeholder="$t('validate.placeholder_description')"></textarea>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>


                <h3>{{ $t('validate.sub_title_final') }}</h3>
                <div class="group">
                    <table class="table-fields">
                        <thead>
                            <tr>
                                <th scope="col">{{ $t('validate.th_validate') }}</th>
                                <th scope="col">{{ $t('validate.th_refuse') }}</th>
                                <th scope="col">{{ $t('validate.th_reason') }}</th>
                                <th scope="col">{{ $t('validate.th_save') }}</th>
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
                                        :placeholder="$t('validate.placeholder_final')" class="final-textarea">
                                    </textarea>
                                </td>
                                <td class="final-submit">
                                    <button @click="updateArticle(article)">{{ $t('validate.save_button') }}</button>
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
import { onMounted, ref, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import extractYoutubeUrl from "../utils/extractYoutubeUrl";
import Player from "./Player.vue";
import url from "../utils/url";
import { useAuthStore } from "@/stores/auth";
import CheckIcon from "./icons/CheckIcon.vue";
import CrossIcon from "./icons/CrossIcon.vue";
import { useNavbarStore } from "../stores/navbar";
import { useNavbarHandler } from "../composables/useNavbarHandler";
import { useNotification } from "@kyvg/vue3-notification";
import { useI18n } from "vue-i18n";

const isMobile = ref(false);
const article = ref(null);
const state = ref("loading");
const route = useRoute();
const authStore = useAuthStore();
const tags = ref([]);
const navbarStore = useNavbarStore();
const router = useRouter();
const { handleNavbar } = useNavbarHandler();
const { notify } = useNotification();
const { t } = useI18n();

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
        } else if (entity === 'videoFile') {
            item.refusalReasons.videoFile.value = "";
            item.refusalReasons.videoFile.isValid = true;
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
                        title: t('notification.title.validation'),
                        type: 'warn',
                        text: t('notification.text.invalid_tags'),
                    });
                    canValidate = false
                }
            }

            //Verify fields validations before validate article
            if (article.value.urlYoutube !== null) {
                if (
                    !item.refusalReasons.title.isValid ||
                    !item.refusalReasons.videoContent.isValid ||
                    !item.refusalReasons.description.isValid
                ) {
                    notify({
                        title: t('notification.title.validation'),
                        type: 'warn',
                        text: t('notification.text.invalid_fields'),
                    });
                    canValidate = false
                }
            } else if (article.value.preview !== null) {
                if (
                    !item.refusalReasons.title.isValid ||
                    !item.refusalReasons.preview.isValid ||
                    !item.refusalReasons.description.isValid
                ) {
                    notify({
                        title: t('notification.title.validation'),
                        type: 'warn',
                        text: t('notification.text.invalid_fields'),
                    });
                    canValidate = false
                }
            } else if (article.value.video !== null) {
                if (
                    !item.refusalReasons.title.isValid ||
                    !item.refusalReasons.videoFile.isValid ||
                    !item.refusalReasons.description.isValid
                ) {
                    notify({
                        title: t('notification.title.validation'),
                        type: 'warn',
                        text: t('notification.text.invalid_fields'),
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
        } else if (entity === 'videoFile') {
            item.refusalReasons.videoFile.isValid = false;
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

        axios.put(`${url.baseUrl}/api/v1/tags/${tag.id}/validate`, updatedTag, {
            withCredentials: true,
        }).then(response => {
            notify({
                title: t('notification.title.validation'),
                type: 'success',
                text: t('notification.text.valid_tags'),
            });
        }).catch(error => {
            notify({
                title: t('notification.title.validation'),
                type: 'error',
                text: `${t('notification.text.error_tags_validation')}: ${error.response.data.message}`,
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
                },
                videoFile: {
                    value: article.refusalReasons.videoFile.value,
                    isValid: article.refusalReasons.videoFile.isValid,
                    validatedBy: authStore.user?.id
                }
            }),
            overallReasonForRefusal: article.overallReasonForRefusal,
            isValid: article.isValid,
            validatedBy: authStore.user?.id
        };

        axios.put(`${url.baseUrl}/api/v1/articles/${article.id}/validate`, updatedArticle, {
            withCredentials: true,
        }).then(response => {
            notify({
                title: t('notification.title.validation'),
                type: 'success',
                text: t('notification.text.valid_article'),
            });
            setTimeout(() => {
                router.push(`/validations`);
            }, 2000);
        }).catch(error => {
            notify({
                title: t('notification.title.validation'),
                type: 'error',
                text: `${t('notification.text.error_article_validation')}: ${error.response.data.message}`,
            });
        });
    })
};

const deleteTag = async (tag) => {
    try {
        await axios.delete(`${url.baseUrl}/api/v1/tags/${tag.id}`, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${authStore.token}`,
            },
            withCredentials: true
        })
        notify({
            title: t('notification.title.delete_tag'),
            type: 'success',
            text: response?.data?.message,
        });

        setTimeout(() => {
            router.push('/validations')
        }, 3000)
    } catch (error) {
        notify({
            title: t('notification.title.delete_tag'),
            type: 'error',
            text: error?.respons?.data?.message,
        });
    }
};

onMounted(() => {
    checkWindowSize();

    window.addEventListener('resize', () => {
        checkWindowSize();
    });
    window.scrollTo(0, 0);

    const articleId = route.params.id;

    axios.get(`${url.baseUrl}/api/v1/articles/${articleId}`, {
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
                            title: t('notification.titile.article_fetch'),
                            type: 'error',
                            text: `${t('notification.text.error_parse_refusalReasons')}: ${e.message}`,
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
                title: t('notification.titile.validation_fetch'),
                type: 'error',
                text: `${t('notification.text.error_article_fetch')}: ${error.response.data.message}`,
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

.preview-container {
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.preview-container-mobile {
    margin-bottom: 15px;
}

.mt20 {
    margin-top: 20px;
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
}

.group {
    margin-bottom: 5px;
    padding: 5px;
}

.card {
    background-color: #ebebeb;
    border: 1px solid #ccc;
    border-radius: 15px;
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

.final-submit,
.tag-submit {
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

.action-container-mobile {
    display: flex;
    justify-content: center;
    align-items: center;
}

.icon-fields-mobile {
    cursor: pointer;
    width: 60px !important;
    font-size: 30px;
    text-align: center;
    border: 1px solid grey;
    margin-bottom: 10px;
    border-radius: 10px;
    margin-right: 15px;
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

.delete-button {
    border-color: #ff4d4d !important;
    background-color: #ccc !important;
    color: red !important;
}

.delete-button:hover {
    background-color: #ff4d4d77 !important;
    border-color: #ff4d4d !important;
    color: red !important;
}

@media (max-width: 768px) {
    h3 {
        text-align: center;
    }

    .tag-row {
        display: block;
        text-align: center;
        margin-bottom: 10px;
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

    span.validated,
    div.validated {
        background-color: green;
    }

    span.refused,
    div.refused {
        background-color: crimson;
    }

}
</style>
