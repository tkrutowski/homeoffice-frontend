<script setup lang="ts">
const props = defineProps({
  icon: {
    type: String,
    required: false,
    default: "pi-file",
  },
  btnDisabled: {
    type: Boolean,
    required: false,
  },
  active: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
<template>
  <Button class="icon-only" :class="{ isActive: active }">
    <i class="pi" :class="props.icon" :style="{ fontWeight: 'bold' }"></i>
  </Button>
</template>

<style scoped>
.icon-only {
  display: block;
  background-color: rgb(238, 127, 0);
  color: #332600 !important;
  border-color: rgb(238, 127, 0) !important;

  outline: none; /* Brak zarysu po kliknięciu */
  padding: 10px 20px; /* Padding wewnątrz przycisku */
  border-radius: 4px; /* Zaokrąglenie rogów przycisku */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Cień zewnętrzny dla efektu głębi */
  transition: box-shadow 0.3s ease, transform 0.3s ease; /* Animacja dla płynności */
}

.icon-only:hover {
  color: white !important;
  background-color: rgba(153, 82, 0) !important;
}

.icon-only:disabled {
  color: white !important;
  background-color: gray !important;
}

.icon-only:focus {
  outline: none !important;
  box-shadow: none !important;
}
.isActive {
  /* Przykładowy styl dla efektu wciśniętego przycisku */
  background-color: #b35f00 !important;
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.2);
  transform: translateY(2px);
  border: 2px solid #f90;
}
</style>
