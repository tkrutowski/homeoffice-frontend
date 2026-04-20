<script setup lang="ts">
  /**
   * Wypełnia obszar `<main>` z App.vue (`flex-1 min-h-0`). Slot `#top` (np. menu sekcji) jest poza przewijanym
   * blokiem; przewija się wyłącznie slot domyślny (treść strony: formularz, tabela, panel itd.).
   */
  withDefaults(
    defineProps<{
      /** false: slot domyślny wypełnia wysokość (flex), bez zewnętrznego scrolla — użyj przy układzie dwukolumnowym z własnym przewijaniem */
      scrollDefaultSlot?: boolean;
    }>(),
    { scrollDefaultSlot: true }
  );
</script>

<template>
  <div class="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-hidden">
    <div v-if="$slots.top" class="shrink-0">
      <slot name="top" />
    </div>
    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div
        class="min-h-0 flex-1 basis-0 overflow-x-auto"
        :class="scrollDefaultSlot ? 'overflow-y-auto' : 'flex min-h-0 flex-col overflow-y-hidden'"
      >
        <slot />
      </div>
    </div>
    <div v-if="$slots.bottom" class="shrink-0">
      <slot name="bottom" />
    </div>
  </div>
</template>
