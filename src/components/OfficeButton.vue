<template>
  <Button
    type="button"
    :class="{
      'office-regular': btnType === 'office-regular',
      'office-save': btnType === 'office-save',
    }"
    :disabled="btnDisabled"
    :loading="loading"
    icon-pos="right"
    :label="text"
  >
  </Button>
</template>

<script setup lang="ts">
import ButtonType from "@/types/ButtonType";

defineProps({
  btnType: {
    //dodanie typu
    type: String as () => ButtonType,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  btnDisabled: {
    type: Boolean,
    required: false,
  },
  loading: {
    type: Boolean,
    required: false,
  },
});
</script>

<style scoped>


.office-regular {
  background-color: var(--office-color);
  color: #332600 !important;
  border-color: var(--office-color) !important;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: bold;
}

.office-regular:hover {
  background-color: var(--office-color-hoover)!important;
}

.office-regular:disabled {
  color: white !important;
  background-color: gray !important;
}

.office-regular:focus {
  outline: none !important;
  box-shadow: none !important;
}

.office-save {
  background-color: rgba(220, 56, 72, 0.7) !important;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: bold;
  color: rgb(232, 230, 227) !important;
  border-color: rgb(128, 123, 0, 1) !important;
}

.office-save:hover {
  color: white !important;
  background-color: rgba(220, 56, 72) !important;
}

.office-save:disabled {
  color: white !important;
  background-color: gray !important;
}

.office-save:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>
