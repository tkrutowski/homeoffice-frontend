<script setup lang="ts">
import TheFooter from "@/components/TheFooter.vue";
import TheMenuFinance from "@/components/TheMenuFinance.vue";
import { UtilsService } from "@/service/UtilsService";
UtilsService.getTypesForFinance();
</script>

<template>
  <TheMenuFinance />
  <h1 class="color-orange flex justify-content-center mt-8">
    Tutaj będą nadchodzące opłaty... ;)
  </h1>
  <TheFooter />
</template>

<style scoped></style>
