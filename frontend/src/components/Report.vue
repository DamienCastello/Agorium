<template>
    <div class="report-container pico">

        <h1>Signaler un {{ props.entity === 'articles' ? 'article' : 'commentaire' }}</h1>
        <div v-if="state === 'error'">
            <p>Impossible de signaler {{ props.entity === 'articles' ? 'l\'article' : 'le commentaire' }}</p>
        </div>
        <div v-else-if="state === 'loading'">
            <p>Chargement ...</p>
        </div>
        <p v-else-if="state === 'idle'">
            Si vous pensez que {{ props.entity === 'articles' ? 'cet article' : 'ce commentaire' }} enfreint les règles
            ou contient des informations inappropriées, vous pouvez
            le signaler ici.
        </p>

        <form @submit.prevent="submitReport">
            <div class="form-group">
                <label for="reason">Raison du signalement :</label>
                <select id="reason" v-model="report.reason" required>
                    <option value="" disabled selected>Choisissez une raison</option>
                    <option value="spam">Spam</option>
                    <option value="inappropriate">Contenu inapproprié</option>
                    <option v-if="props.entity === 'article'" value="copyright">Infraction de droits d'auteur</option>
                    <option value="other">Autre</option>
                </select>
            </div>

            <div v-if="props.entity === 'articles' && report.reason === 'inappropriate' || report.reason === 'other'"
                class="form-group">
                <label>Champs posant problème :</label>
                <div class="checkbox-fields">
                    <div>
                        <label>
                            <input type="checkbox" v-model="fieldsToCheck.title" /> Titre
                        </label>
                    </div>
                    <div>
                        <label>
                            <input type="checkbox" v-model="fieldsToCheck.description" /> Description
                        </label>
                    </div>
                    <div v-if="globalStore.reportType === 'youtube'">
                        <label>
                            <input type="checkbox" v-model="fieldsToCheck.videoContent" /> Contenu vidéo
                        </label>
                    </div>
                    <div v-if="globalStore.reportType === 'preview'">
                        <label>
                            <input type="checkbox" v-model="fieldsToCheck.preview" /> Image d'illustration
                        </label>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="details">Détails (optionnel) :</label>
                <textarea id="details" v-model="report.details"
                    placeholder="Expliquez pourquoi vous signalez cet article..."></textarea>
            </div>

            <button type="submit" :disabled="isSubmitting || report.reason === ''" class="submit-button">
                {{ isSubmitting ? "Envoi en cours..." : "Signaler" }}
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

const isSubmitting = ref(false);
const state = ref("idle");

const props = defineProps(['entity', 'articleId', 'commentId']);

const buildRefusalReasons = () => {
    return {
        title: {
            value: fieldsToCheck.value.title ? "Problème détecté dans le titre." : "",
            isValid: !fieldsToCheck.value.title,
            validatedBy: null
        },
        description: {
            value: fieldsToCheck.value.description ? "Problème détecté dans la description." : "",
            isValid: !fieldsToCheck.value.description,
            validatedBy: null
        },
        videoContent: {
            value: fieldsToCheck.value.videoContent ? "Problème détecté dans le contenu vidéo." : "",
            isValid: !fieldsToCheck.value.videoContent,
            validatedBy: null
        },
        preview: {
            value: fieldsToCheck.value.preview ? "Problème détecté dans l'image d'illustration." : "",
            isValid: !fieldsToCheck.value.preview,
            validatedBy: null
        },
    };
};

const submitReport = async () => {
    if (!report.value.reason) {
        notify({
            title: "Report Reason",
            type: "warn",
            text: "Please select a reason.",
        });
        return;
    }

    try {
        isSubmitting.value = true;
        state.value = 'loading';
        const userId = authStore.user?.id ?? null;

        if (props.entity === 'articles') {
            await axios.post(`${url.baseUrl}:${url.portBack}/api/v1/articles/${props.articleId}/report`, {
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

            await axios.put(`${url.baseUrl}:${url.portBack}/api/v1/articles/${props.articleId}/`, {
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
                title: "Report",
                type: "success",
                text: "Article reported successfully!",
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
            await axios.post(`${url.baseUrl}:${url.portBack}/api/v1/comments/${props.commentId}/report`, {
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
                title: "Report",
                type: "success",
                text: "Comment reported successfully!",
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
            title: "Report",
            type: "error",
            text: "An error occurs, please retry.",
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
