<script setup lang="ts">
  import { computed, useSlots } from 'vue';

  const props = defineProps({
    icon: {
      type: String,
      required: false,
      default: 'pi pi-file',
    },
    btnDisabled: {
      type: Boolean,
      required: false,
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    active: {
      type: Boolean,
      required: false,
      default: false,
    },
    rounded: {
      type: Boolean,
      required: false,
      default: true,
    },
  });

  const slots = useSlots();
  const hasCustomIcon = computed(() => !!slots.icon);
</script>
<template>
  <span v-if="props.loading" class="loading-spinner-container">
    <i class="loading-spinner pi pi-spin pi-spinner"></i>
  </span>
  <Button
    v-else
    class="icon-only"
    :icon="hasCustomIcon ? undefined : props.icon"
    :rounded="props.rounded"
    :class="{ isActive: props.active }"
    :disabled="props.btnDisabled || props.loading"
    :loading="props.loading"
  >
    <template v-if="hasCustomIcon" #icon="slotProps">
      <span v-bind="slotProps" class="office-icon-button__custom-icon inline-flex items-center justify-center">
        <slot name="icon" />
      </span>
    </template>
  </Button>
</template>
<style scoped>
  .icon-only {
    outline: none !important;
    border: none !important;
    padding: 10px 20px;
    border-radius: 4px;
    box-shadow: none !important;
    background: transparent !important;
    transition: none;
  }

  .icon-only :deep(.p-button-icon) {
    transition: transform 0.3s ease;
    font-size: 1.2rem;
  }

  .office-icon-button__custom-icon {
    transition: transform 0.3s ease;
  }

  .office-icon-button__custom-icon :deep(svg) {
    width: 1.2rem;
    height: 1.2rem;
  }

  .loading-spinner-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
  }

  .loading-spinner {
    font-size: 1.2rem;
    transform-origin: center center;
  }

  .icon-only:disabled {
    color: #53575e !important;
    opacity: 0.6;
  }

  .icon-only:disabled :deep(.p-button-icon) {
    color: #53575e !important;
  }

  .icon-only:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  .icon-only:hover :deep(.p-button-icon),
  .icon-only:hover :deep(.office-icon-button__custom-icon) {
    transform: scale(1.4);
  }

  .isActive {
    position: relative;
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.2);
    border: 1px solid currentColor !important;
  }

  .isActive::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: currentColor;
    opacity: 0.2;
    border-radius: inherit;
    pointer-events: none;
  }
</style>
