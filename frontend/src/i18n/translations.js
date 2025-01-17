import { createI18n } from 'vue-i18n';

const messages = {
    en: {
        navigation: {
            language_en: 'English',
            language_fr: 'French',
            validations: 'Validations',
            articles: 'Articles',
            publish: 'Publish',
            login: 'Login',
            signup: 'Signup',
            account: 'Account',
            profile: 'My profile',
            logout: 'Logout',
        },
    },
    fr: {
        navigation: {
            language_en: 'Anglais',
            language_fr: 'French',
            validations: 'Validations',
            articles: 'Articles',
            publish: 'Publier',
            login: 'Se connecter',
            signup: 'S\'inscrire',
            account: 'Compte',
            profile: 'Mon profil',
            logout: 'Se déconnecter',
        },
    },
};

const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'fr',
    messages,
});

export default i18n;
