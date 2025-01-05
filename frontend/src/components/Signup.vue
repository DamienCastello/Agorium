<template>
    <div class="signup-container" @mousedown="handleClickOutsideNavbar">
      <h1>Créer un compte</h1>
      <form @submit.prevent="handleSignup">
        <fieldset>
          <label for="email">Email</label>
          <input id="email" type="email" v-model="form.email" required />
        </fieldset>
        <fieldset>
          <label for="password">Mot de passe</label>
          <input id="password" type="password" v-model="form.password" required />
        </fieldset>
        <fieldset>
          <label for="avatar">Avatar (optionnel)</label>
          <input :disabled="navbarStore.isMenuOpen" id="avatar" type="file" @change="handleFileChange" />
        </fieldset>
        <button :disabled="navbarStore.isMenuOpen" type="submit">S'inscrire</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </template>
  
  <script setup>
  import axios from "axios";
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import url from "@/utils/url";
  import { useNavbarStore } from "@/stores/navbar";
  
  const router = useRouter();
  const form = ref({
    email: "",
    password: "",
  });
  const avatarFile = ref(null);
  const error = ref("");
  const navbarStore = useNavbarStore();
  
  const handleFileChange = (event) => {
    avatarFile.value = event.target.files[0];
  };
  
  const handleSignup = async () => {
    try {
      const formData = new FormData();
      formData.append("email", form.value.email);
      formData.append("password", form.value.password);
      if (avatarFile.value) {
        formData.append("avatar", avatarFile.value);
      }
  
      const response = await axios.post(`${url.baseUrl}:${url.portBack}/api/v1/auth/signup`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("Inscription réussie : ", response.data);
  
      router.push("/login");
    } catch (err) {
      console.error("Erreur lors de l'inscription : ", err);
      error.value = err.response?.data?.message || "Une erreur s'est produite.";
    }
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
  
  <style scoped>
  .signup-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 16px;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  
  fieldset {
    margin-bottom: 16px;
  }
  
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  input[type="email"],
  input[type="password"],
  input[type="file"] {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  
  .error {
    color: red;
    margin-top: 8px;
  }
  </style>
  