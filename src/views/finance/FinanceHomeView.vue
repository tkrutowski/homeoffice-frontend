<script setup lang="ts">
import TheMenuFinance from '@/components/finance/TheMenuFinance.vue'
import { UtilsService } from '@/service/UtilsService'
UtilsService.getTypesForFinance()
</script>

<template>
  <TheMenuFinance />
  <p class="text-4xl text-center mt-8">Tutaj będą nadchodzące opłaty... ;)</p>
</template>
<style scoped></style>
