<template>
  <div class="pico">
    <h3>Commentaires</h3>
    <div class="comments" v-for="comment in props.article.comments" :key="comment.id">
      <p><span>{{ comment.user.name }}:</span> {{ comment.content }}</p>
    </div>
    <div class="comment-container" @mousedown="handleClickOutsideNavbar">
      <label for="comment" class="comment-label">Laisser un commentaire :</label>
      <textarea id="comment" name="comment" v-model="newComment" placeholder="Mon commentaire de zinzin..."
        aria-label="Zone de saisie pour commenter" :disabled="!authStore.user" class="comment-textarea"></textarea>
      <div class="submit-zone">
        <p v-if="!authStore.user" class="comment-info">
          Connectez-vous pour laisser un commentaire.
        </p>
        <button @click="submitComment" :disabled="!newComment || !authStore.user || navbarStore.isMenuOpen"
          class="submit-button">
          Envoyer
        </button>
      </div>
    </div>
    <notifications position="bottom right" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import url from "@/utils/url";
import { useAuthStore } from "@/stores/auth";
import { useNavbarStore } from "@/stores/navbar";
import { useNotification } from "@kyvg/vue3-notification";


const props = defineProps(["article", "refreshComments"]);
const newComment = ref("");
const authStore = useAuthStore();
const navbarStore = useNavbarStore();
const { notify } = useNotification()

const submitComment = () => {
  if (!authStore.user) {
    notify({
      title: "Commenting Article",
      type: 'warn',
      text: 'User not logged in. Unable to post comment.',
    });
    return;
  }

  if (!newComment.value.trim()) {
    notify({
      title: "Commenting Article",
      type: 'warn',
      text: 'comment can not be empty.',
    });
    return;
  }

  axios
    .post(
      `${url.baseUrl}:${url.portBack}/api/v1/comments/`,
      {
        articleId: props.article.id,
        content: newComment.value,
      },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      notify({
        title: "Commenting Article",
        type: 'success',
        text: 'comment created successfully !',
      });

      if(response.data.achievement) {
        notify({
          title: 'New Badge Obtained',
          text: `You have won the badge ${response.data.achievement.name} !`,
        });
      }
      
      newComment.value = "";
      if (props.refreshComments) {
        props.refreshComments();
      }
    })
    .catch((error) => {
      notify({
        title: "Commenting Article",
        type: 'error',
        text: error.response.data.message,
      });
    });
};

const handleClickOutsideNavbar = (event) => {
  if (navbarStore.isMenuOpen) {
    event.preventDefault();
    event.stopPropagation();
    navbarStore.closeMenu();
  } else {
    return true;
  }
};
</script>

<style>
.comments {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  white-space: normal;
  word-wrap: break-word;
  text-align: left;
  margin-bottom: 8px;
}

.comments span {
  font-weight: bold;
  margin-right: 8px;
}

@media (max-width: 768px) {
  .comments {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .comments span {
    margin-right: 4px;
  }
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
  padding: 8px 14px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  max-width: 150px;
}

.submit-button:disabled {
  background-color: #d3d3d3;
  cursor: not-allowed;
}
</style>