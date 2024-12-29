<template>
    <h3>Commentaires</h3>
    <p class="comments" v-for="comment in props.article.comments" :key="comment.id">
        <span>{{ comment.user.name }}:</span>{{ comment.content }}
    </p>
    <div class="comment-container">
        <label for="comment" class="comment-label">Laisser un commentaire :</label>
        <textarea
            id="comment"
            name="comment"
            v-model="newComment"
            placeholder="Mon commentaire de zinzin..."
            aria-label="Zone de saisie pour commenter"
            :disabled="!authStore.user"
            class="comment-textarea"
        ></textarea>
        <div class="submit-zone">
            <p v-if="!authStore.user" class="comment-info">Connectez-vous pour laisser un commentaire.</p>
            <button 
                @click="submitComment"
                :disabled="!newComment || !authStore.user"
                class="submit-button"
            >
                Envoyer
            </button>
        </div>
    </div>
</template>
  
<script setup>
  import { ref } from "vue";
  import axios from "axios";
  import url from "@/utils/url";
  import { useAuthStore } from "@/stores/auth";
  
  const props = defineProps(['article', 'refreshComments']);
  const newComment = ref("");
  const authStore = useAuthStore();
  
  const submitComment = () => {
    if (!authStore.user) {
      console.warn("Utilisateur non connecté. Impossible d'envoyer un commentaire.");
      return;
    }
  
    if (!newComment.value.trim()) {
      console.warn("Commentaire vide.");
      return;
    }

    axios.post(`${url.baseUrl}:${url.portBack}/api/v1/comments/`, {
        articleId: props.article.id,
        content: newComment.value,
    }, {
        withCredentials: true,
        headers: {
        "Authorization": `Bearer ${authStore.token}`,
        "Content-Type": "application/json",
        },
    })
    .then(() => {
        console.log("Commentaire soumis :", newComment.value);
        newComment.value = "";
        if (props.refreshComments) {
            props.refreshComments();
        }
    })
    .catch((error) => {
      console.error("Error on commenting article:", error);
      state.value = "error";
    });
  };
</script>
  
<style>
.comments {
display: flex;
justify-content: flex-start;
}

.comments span {
padding-right: 5px;
}
.comment-container {
margin-top: 40px;
display: flex;
flex-direction: column;
gap: 10px;
}

.comment-label {
font-weight: bold;
margin-bottom: 5px;
font-size: 16px;
}

.comment-textarea {
width: 100%;
min-height: 80px;
padding: 8px;
border: 1px solid #ccc;
border-radius: 5px;
resize: vertical;
font-size: 14px;
}

.comment-textarea[disabled] {
background-color: #f9f9f9;
cursor: not-allowed;
}

.submit-zone {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.comment-info {
font-size: 12px;
color: gray;
}

.submit-button {
padding: 10px 20px;
background-color: rgb(64, 64, 191);
color: white;
border: none;
border-radius: 5px;
cursor: pointer;
font-size: 14px;
max-width: 100px;
}

.submit-button:disabled {
background-color: #d3d3d3;
cursor: not-allowed;
}
</style>
  