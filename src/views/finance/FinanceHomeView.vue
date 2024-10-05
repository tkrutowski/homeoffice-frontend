<script setup lang="ts">
import TheMenuFinance from "@/components/finance/TheMenuFinance.vue";
import { UtilsService } from "@/service/UtilsService";
UtilsService.getTypesForFinance();
</script>

<template>
  <TheMenuFinance />
  <h1 class="flex justify-center mt-8">
    Tutaj będą nadchodzące opłaty... ;)
  </h1>
</template>

<style scoped></style>
