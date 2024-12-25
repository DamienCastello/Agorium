<template>
  <transition name="fade-slide" mode="out-in">
    <slot></slot>
  </transition>
</template>

<style>
    .fade-slide-enter-active,
    .fade-slide-leave-active {
        transition: 1s;
    }

    .fade-slide-enter-from {
        opacity: 0;
        transform: translateX(10px);
    }

    .fade-slide-leave-to {
        opacity: 0;
        transform: translateX(-10px);
    }
</style>