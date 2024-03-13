<template>
  <div>
    <input :value="props.modelValue" @input="emit('update:modelValue', $event.target.value)" />
  </div>
</template>

<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>
