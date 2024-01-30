<template>
  <button
    class="btn"
    :class="{
      office: btnType === 'office',
      'office-save': btnType === 'office-save',
    }"
    :disabled="btnDisabled"
  >
    {{ text }}
    <span
      v-if="isBusyIcon"
      class="spinner-border spinner-border-sm"
      role="status"
      aria-hidden="true"
    ></span>
    <span
      v-if="isErrorIcon"
      class="pi pi-times color-red"
      role="status"
      aria-hidden="true"
    ></span>
    <span
      v-if="isOkIcon"
      class="pi pi-check color-green"
      role="status"
      aria-hidden="true"
    ></span>
  </button>
</template>

<script setup lang="ts">
import ButtonType from "@/assets/types/ButtonType";

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
  isBusyIcon: {
    type: Boolean,
    required: false,
  },
  isErrorIcon: {
    type: Boolean,
    required: false,
  },
  isOkIcon: {
    type: Boolean,
    required: false,
  },
});
</script>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.office {
  display: block;
  background-color: rgb(238, 127, 0);
  color: #332600 !important;
  border-color: rgb(238, 127, 0) !important;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  font-weight: bold;
}

.office:hover {
  color: white !important;
  background-color: rgba(153, 82, 0) !important;
}

.office:disabled {
  color: white !important;
  background-color: gray !important;
}

.office:focus {
  outline: none !important;
  box-shadow: none !important;
}

.office-save {
  display: block;
  width: 150px;
  background-color: rgba(220, 56, 72, 0.7) !important;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgb(232, 230, 227) !important;
  border-color: rgb(238, 127, 0, 1) !important;
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
