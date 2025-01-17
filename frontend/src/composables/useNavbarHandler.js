import { useNavbarStore } from '@/stores/navbar';

export const useNavbarHandler = () => {
  const navbarStore = useNavbarStore();

  const handleNavbar = (callback) => {
    if (navbarStore.isMenuOpen) {
      navbarStore.closeMenu();
      return;
    }
    
    if (navbarStore.isTranslationOpen) {
      navbarStore.closeTranslation();
      return;
    }

    if (callback) callback();
  };

  return { handleNavbar };
};