<template>
  <Button
    type="button"
    :class="{
      office: btnType === 'office',
      'office-save': btnType === 'office-save',
    }"
    :disabled="btnDisabled"
    :loading="loading"
    icon-pos="right"
    :label="text"
  />
</template>

<script setup lang="ts">
import { ButtonType } from "@/assets/types/ButtonType";

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
.office {
  display: block;
  background-color: rgb(238, 127, 0);
  color: #332600 !important;
  border-color: rgb(238, 127, 0) !important;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: bold;
  border-radius: 5px;
}

.office:hover {
  background-color: rgba(255, 180, 80) !important;
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
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgb(232, 230, 227) !important;
  border-color: rgb(238, 127, 0, 1) !important;
  border-radius: 5px;
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
