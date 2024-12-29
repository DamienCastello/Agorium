<template>
    <fieldset>
      <label for="urlYoutube">URL Youtube <span style="color: red">*</span></label>
      <input
        id="urlYoutube"
        type="text"
        placeholder="https://www.youtube.com/watch?v=U3tqI9Sf5yU"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </fieldset>
  </template>
  
<script setup>
defineProps({
  modelValue: String,
});

defineEmits(["update:modelValue"]);
</script>
  