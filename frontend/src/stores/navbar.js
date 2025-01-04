import { defineStore } from 'pinia';

export const useNavbarStore = defineStore('navbar', {
  state: () => ({
    isMenuOpen: false,
  }),
  actions: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
      
    },
    closeMenu() {
      this.isMenuOpen = false;
      console.log("check in store: ", this.isMenuOpen)
    },
    openMenu() {
      this.isMenuOpen = true;
    }
  },
});