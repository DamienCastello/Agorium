<template>
    <nav class="navbar">
        <!-- Titre à gauche -->
        <ul class="navbar-title">
            <li><strong>Wake Up Normies</strong></li>
        </ul>

        <!-- Liens à droite -->
        <ul class="navbar-links">
            <li>
                <RouterLink 
                    to="/articles" 
                    :class="{ 'active': isActiveRoute('/articles') }">
                    Articles
                </RouterLink>
            </li>
            <li v-if="isAuthenticated">
                <RouterLink 
                    to="/new-article" 
                    :class="{ 'active': isActiveRoute('/new-article') }">
                    New Article
                </RouterLink>
            </li>
            <li v-if="!isAuthenticated">
                <RouterLink 
                    to="/login" 
                    :class="{ 'active': isActiveRoute('/login') }">
                    Login
                </RouterLink>
            </li>
            <li v-if="!isAuthenticated">
                <RouterLink 
                    to="/signup" 
                    :class="{ 'active': isActiveRoute('/signup') }">
                    Signup
                </RouterLink>
            </li>
            <li v-if="isAuthenticated">
                <details role="menu" class="dropdown">
                    <summary><span>Account</span></summary>
                    <ul>
                        <li>
                            <RouterLink to="/profile" :class="{ 'active': isActiveRoute('/profile') }">
                                My Profile
                            </RouterLink>
                        </li>
                        <li>
                            <button @click="logout">Logout</button>
                        </li>
                    </ul>
                </details>
            </li>
        </ul>
    </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const logout = () => authStore.logout();
const route = useRoute();

// Helper function to detect the active route
const isActiveRoute = (path) => route.path === path;

defineProps(['isAuthenticated']);
</script>

<style scoped>
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.navbar-title {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
    list-style: none;
}

.navbar-title li {
    font-size: 1.5rem;
    font-weight: bold;
}

.navbar-links {
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 1rem;
    border-radius: var(--radius);
    margin: 0;
    list-style: none;
}

.navbar-links a {
    text-decoration: none;
    font-size: 1rem;
}

.navbar-links a:hover,
.navbar-links a:focus {
    background: none;
    text-decoration: none;
}

/* Lien actif */
.navbar-links a.active {
    font-weight: bold;
}

.dropdown ul {
    list-style: none;
    margin: 0;
    padding: 0;
}


.dropdown ul li a.active {
    font-weight: bold;
    color: rgb(64, 64, 191);
    font-size: 1rem;
    padding: 0.5rem;
    text-decoration: none;
}

.dropdown ul li:hover {
    background: var(--secondary);
    color: var(--dark);
}

span {
    color: rgb(64, 64, 191);
    font-size: 1rem;
    padding: 0.5rem;
    text-decoration: none;
}
</style>
