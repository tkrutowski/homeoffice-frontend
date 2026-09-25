<script setup lang="ts">
  import { LOG_LEVELS, type LogLevel } from '@/features/admin/logs/types';
  import { LOG_LEVEL_STYLES } from '@/features/admin/logs/logLevelStyles';

  const props = defineProps<{
    /** Liczba wpisów danego poziomu w aktualnych wynikach (opcjonalnie). */
    counts?: Partial<Record<LogLevel, number>>;
  }>();

  const selected = defineModel<LogLevel[]>({ required: true });

  function toggle(level: LogLevel) {
    if (selected.value.includes(level)) {
      // co najmniej jeden poziom musi zostać wybrany (pusty filtr = wszystkie, a tak by to nie wyglądało)
      if (selected.value.length === 1) return;
      selected.value = selected.value.filter(l => l !== level);
    } else {
      selected.value = LOG_LEVELS.filter(l => l === level || selected.value.includes(l));
    }
  }

  const count = (level: LogLevel) => props.counts?.[level];
</script>

<template>
  <div class="flex items-center gap-2.5">
    <span class="text-xs font-medium text-surface-600 dark:text-surface-400">Poziom</span>
    <div class="flex flex-wrap gap-2" role="group" aria-label="Filtr poziomów">
      <button
        v-for="level in LOG_LEVELS"
        :key="level"
        type="button"
        :aria-pressed="selected.includes(level)"
        class="flex h-[34px] cursor-pointer items-center gap-2 rounded-full border px-3 text-[13px] font-medium"
        :class="
          selected.includes(level)
            ? [
                'bg-surface-100 text-surface-900 dark:bg-surface-800 dark:text-surface-0',
                LOG_LEVEL_STYLES[level].border,
              ]
            : 'border-surface-300 bg-transparent text-surface-600 dark:border-surface-600 dark:text-surface-400'
        "
        @click="toggle(level)"
      >
        <span class="h-2 w-2 rounded-full" :class="LOG_LEVEL_STYLES[level].dot" />
        {{ level }}
        <span v-if="count(level) !== undefined" class="font-mono text-xs opacity-85">{{ count(level) }}</span>
      </button>
    </div>
  </div>
</template>
