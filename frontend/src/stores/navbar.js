import { defineStore } from 'pinia';

export const useNavbarStore = defineStore('navbar', {
  state: () => ({
    isMenuOpen: false,
    isTranslationOpen: false
  }),
  actions: {
    toggleMenu() {
      this.isTranslationOpen = false;
      this.isMenuOpen = !this.isMenuOpen;
    },
    toggleTranslation() {
      this.isMenuOpen = false;
      this.isTranslationOpen = !this.isTranslationOpen;
    },
    closeMenu() {
      this.isMenuOpen = false;
    },
    closeTranslation() {
      this.isTranslationOpen = false;
    },
    openMenu() {
      this.isTranslationOpen = false;
      this.isMenuOpen = true;
    },
    openTranslation() {
      this.isMenuOpen = false;
      this.isTranslationOpen = true;
    }
  }
});