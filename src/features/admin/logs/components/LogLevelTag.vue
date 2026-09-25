<script setup lang="ts">
  import { LOG_LEVEL_STYLES } from '@/features/admin/logs/logLevelStyles';
  import type { LogLevel } from '@/features/admin/logs/types';

  defineProps<{ level: LogLevel }>();
</script>

<template>
  <span
    class="inline-block min-w-[3.25rem] rounded px-2 text-center font-mono text-[11px] font-medium leading-5"
    :class="LOG_LEVEL_STYLES[level].badge"
  >
    {{ level }}
  </span>
</template>
