<template>
    <div class="report-container pico">

        <h1>{{ $t('report.title') }} {{ props.entity === 'articles' ? $t('report.title_subject_article') : $t('report.title_subject_comment') }}</h1>
        <div v-if="state === 'error'">
            <p>{{ $t('report.state_error') }} {{ props.entity === 'articles' ? $t('report.error_subject_article') : $t('report.error_subject_comment') }}</p>
        </div>
        <div v-else-if="state === 'loading'">
            <p>{{ $t('report.state_loading') }}</p>
        </div>
        <p v-else-if="state === 'idle'">
            {{ $t('report.pre_content') }} {{ props.entity === 'articles' ? $t('report.content_subject_article') : $t('report.content_subject_comment') }} {{ $t('report.post_content') }}
        </p>

        <form @submit.prevent="submitReport">
            <div class="form-group">
                <label for="reason">{{ $t('report.label_reason_select') }} :</label>
                <select id="reason" v-model="report.reason" required>
                    <option value="" disabled selected>{{ $t('report.option_default') }}</option>
                    <option value="spam">{{ $t('report.option_spam') }}</option>
                    <option value="inappropriate">{{ $t('report.option_content') }}</option>
                    <option v-if="props.entity === 'articles'" value="copyright">{{ $t('report.option_copyright') }}</option>
                    <option value="other">{{ $t('report.option_other') }}</option>
                </select>
            </div>

            <div v-if="props.entity === 'articles' && report.reason === 'inappropriate' || report.reason === 'other'"
                class="form-group">
                <label>{{ $t('report.label_fields_select') }} :</label>
                <div class="checkbox-fields">
                    <div>
                        <label>
                            <input type="checkbox" v-model="fieldsToCheck.title" /> {{ $t('report.option_title') }}
                        </label>
                    </div>
                    <div>
                        <label>
                            <input type="checkbox" v-model="fieldsToCheck.description" /> {{ $t('report.option_description') }}
                        </label>
                    </div>
                    <div v-if="globalStore.reportType === 'youtube'">
                        <label>
                            <input type="checkbox" v-model="fieldsToCheck.videoContent" /> {{ $t('report.option_video') }}
                        </label>
                    </div>
                    <div v-if="globalStore.reportType === 'preview'">
                        <label>
                            <input type="checkbox" v-model="fieldsToCheck.preview" /> {{ $t('report.option_preview') }}
                        </label>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="details">{{ $t('report.label_textarea') }} :</label>
                <textarea id="details" v-model="report.details"
                    :placeholder="$t('report.placeholder_textarea')"></textarea>
            </div>

            <button type="submit" :disabled="isSubmitting || report.reason === ''" class="submit-button">
                {{ isSubmitting ? $t('report.submitting') : $t('report.submit_button') }}
            </button>
        </form>
    </div>
    <notifications position="bottom right" />
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useNotification } from "@kyvg/vue3-notification";
import url from "@/utils/url";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global";
import { useI18n } from "vue-i18n";

const report = ref({
    reason: "",
    details: "",
});
const fieldsToCheck = ref({
    title: false,
    description: false,
    videoContent: false,
    preview: false,
});
const authStore = useAuthStore();
const globalStore = useGlobalStore();
const router = useRouter();
const { notify } = useNotification();
const { t } = useI18n();

const isSubmitting = ref(false);
const state = ref("idle");

const props = defineProps(['entity', 'articleId', 'commentId']);

const buildRefusalReasons = () => {
    return {
        title: {
            value: fieldsToCheck.value.title ? t('report.reason_title') : "",
            isValid: !fieldsToCheck.value.title,
            validatedBy: null
        },
        description: {
            value: fieldsToCheck.value.description ? t('report.reason_description') : "",
            isValid: !fieldsToCheck.value.description,
            validatedBy: null
        },
        videoContent: {
            value: fieldsToCheck.value.videoContent ? t('report.reason_video') : "",
            isValid: !fieldsToCheck.value.videoContent,
            validatedBy: null
        },
        preview: {
            value: fieldsToCheck.value.preview ? t('report.reason_preview') : "",
            isValid: !fieldsToCheck.value.preview,
            validatedBy: null
        },
    };
};

const submitReport = async () => {
    if (!report.value.reason) {
        notify({
            title: t('notification.title.report_reason'),
            type: "warn",
            text: t('notification.text.report_reason'),
        });
        return;
    }

    try {
        isSubmitting.value = true;
        state.value = 'loading';
        const userId = authStore.user?.id ?? null;

        if (props.entity === 'articles') {
            await axios.post(`${url.baseUrl}/api/v1/articles/${props.articleId}/report`, {
                articleId: props.articleId,
                userId,
                reason: report.value.reason,
                details: report.value.details,
            }, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            const refusalReasons = report.value.reason === "inappropriate" || report.value.reason === "other"
                ? buildRefusalReasons()
                : null;

            await axios.put(`${url.baseUrl}/api/v1/articles/${props.articleId}/`, {
                refusalReasons: refusalReasons ? JSON.stringify(refusalReasons) : null,
                overallReasonForRefusal: report.value.details
            }, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            notify({
                title: t('notification.title.report_create'),
                type: "success",
                text: t('notification.text.report_article_create'),
            });

            setTimeout(() => {
                state.value = 'idle';
                report.value.reason = "";
                report.value.details = "";
                fieldsToCheck.value = {
                    title: false,
                    description: false,
                    videoContent: false,
                    preview: false,
                };
                globalStore.resetReportType();
                router.push(`/articles`);
            }, 2000);

        } else if (props.entity === 'comments') {
            await axios.post(`${url.baseUrl}/api/v1/comments/${props.commentId}/report`, {
                commentId: props.commentId,
                userId,
                reason: report.value.reason,
                details: report.value.details,
            }, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            notify({
                title: t('notification.title.report_create'),
                type: "success",
                text: t('notification.text.report_comment_create'),
            });

            setTimeout(() => {
                state.value = 'idle';
                report.value.reason = "";
                report.value.details = "";
                router.push(`/articles`);
            }, 2000);
        }
    } catch (error) {
        console.error("Error:", error);
        state.value = 'error';
        notify({
            title: t('notification.title.report_create'),
            type: "error",
            text: t('notification.text.report_error'),
        });
    } finally {
        isSubmitting.value = false;
    }
};
</script>


<style scoped>
.report-container {
    width: 600px;
    margin: 0 auto;
    padding: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h1 {
    font-size: 24px;
    margin-bottom: 16px;
}

p {
    font-size: 14px;
    margin-bottom: 16px;
}

.form-group {
    margin-bottom: 16px;
}

label {
    display: block;
    font-weight: bold;
    margin-bottom: 8px;
}

select,
textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    resize: none;
}

textarea {
    height: 100px;
}

.submit-button {
    padding: 10px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.submit-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.submit-button:hover:not(:disabled) {
    background-color: #0056b3;
}

.success-message {
    color: green;
    margin-top: 16px;
    font-size: 14px;
}

.error-message {
    color: red;
    margin-top: 16px;
    font-size: 14px;
}

.checkbox-fields {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
</style>
