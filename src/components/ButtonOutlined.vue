<script setup lang="ts">
  defineProps({
    text: {
      type: String,
      required: false,
    },
    btnDisabled: {
      type: Boolean,
      required: false,
    },
    loading: {
      type: Boolean,
      required: false,
    },
    icon: {
      type: String,
      required: false,
    },
    iconPos: {
      type: String as () => 'right' | 'left' | 'top' | 'bottom',
      required: false,
      default: 'right',
    },
    title: {
      type: String,
      required: false,
    },
  });
</script>

<template>
  <Button
    type="button"
    class="disabled:bg-surface-500 hover:disabled:!bg-surface-500 px-4 py-2"
    outlined
    :disabled="btnDisabled"
    :loading="loading"
    :icon="icon"
    :icon-pos="iconPos"
    :label="text"
    :title="title"
  >
  </Button>
</template>
