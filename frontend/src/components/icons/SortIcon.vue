<template>
  <div class="icon-container">
    <CalendarIcon class="calendar-icon" />
    <i :class="[{'arrow-icon-down': isDown, 'arrow-icon-up': !isDown}, arrowClass]"></i>
  </div>
</template>

<script setup>
import CalendarIcon from "./CalendarIcon.vue";
import { computed } from "vue";

const props = defineProps({
  isDown: {
    type: Boolean,
    default: true,
  },
});

const arrowClass = computed(() => `fa-solid ${props.isDown ? "fa-sort-down" : "fa-sort-up"}`);
</script>

<style scoped>
.icon-container {
  position: relative;
  display: inline-block;
  width: 25px;
  height: 25px;
}

.calendar-icon {
  width: 100%;
  height: 100%;
  display: block;
  color: #5e5e5e;
}

.arrow-icon-up {
  position: absolute;
  top: 8px;
  left: 4px;
  font-size: 16px;
  color: #5e5e5e;
}

.arrow-icon-down {
  position: absolute;
  top: 0px;
  left: 4px;
  font-size: 16px;
  color: #5e5e5e;
}

@media (max-width: 1100px) {
  .arrow-icon-up {
    position: absolute;
    top: 7px;
    left: 3px;
    font-size: 16px;
    color: #5e5e5e;
  }

  .arrow-icon-down {
    position: absolute;
    top: -1px;
    left: 1px;
    font-size: 16px;
    color: #5e5e5e;
  }
}

@media (max-width: 768px) {
  .arrow-icon-up {
    position: absolute;
    top: 6px;
    left: 2px;
    font-size: 16px;
    color: #5e5e5e;
  }

  .arrow-icon-down {
    position: absolute;
    top: -2px;
    left: 2px;
    font-size: 16px;
    color: #5e5e5e;
  }
}
</style>
