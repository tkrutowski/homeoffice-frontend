<template>
  <Card class="custom-card" style="max-width: 20rem">
    <template #header>
      <h4 class="mb-0 text-center color-orange">
        {{ textTitle }}
      </h4>
    </template>

    <template #content>
      <p class="color-orange">{{ textContent }}</p>
    </template>

    <template #footer>
      <div class="card-footer">
        <OfficeButton
          class="w-full mb-2"
          btn-type="office"
          text="wejście"
          type="button"
          :btn-disabled="btnDisabled"
          @click="clicked"
        />
      </div>
    </template>
  </Card>
</template>
<script setup lang="ts">
import OfficeButton from "@/components/OfficeButton.vue";
// const emit = defineEmits(['clicked'])
const emit = defineEmits<{
  (e: "clicked"): void;
}>();

defineProps({
  textTitle: {
    type: String,
    required: true,
  },
  textContent: {
    type: String,
    required: true,
  },
  btnDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});
function clicked() {
  console.log("clicked");
  emit("clicked");
}
</script>

<style scoped>
.card-footer {
  display: flex;
  justify-content: center;
}
.custom-card {
  background-color: #1a1a1a; /* Wybierz swój kolor */
  border: 2px solid #ee7f00;
}
</style>
