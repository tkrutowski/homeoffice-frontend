<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import OfficeButton from '@/components/OfficeButton.vue';

  /** Minimalny kształt elementu listy — zgodny z FileInfo (url, name, type). */
  export interface FilePreviewItem {
    url: string;
    name?: string;
    type?: string;
  }

  const props = withDefaults(
    defineProps<{
      visible: boolean;
      items: FilePreviewItem[];
      initialIndex?: number;
    }>(),
    {
      initialIndex: 0,
    }
  );

  const emit = defineEmits<{
    'update:visible': [value: boolean];
  }>();

  const currentIndex = ref(0);

  function clampIndex(i: number, len: number): number {
    if (len <= 0) return 0;
    return Math.max(0, Math.min(i, len - 1));
  }

  function syncIndexOnOpen() {
    if (!props.visible) return;
    currentIndex.value = clampIndex(props.initialIndex ?? 0, props.items.length);
  }

  watch(
    () => props.visible,
    v => {
      if (v) syncIndexOnOpen();
    }
  );

  watch(
    () => [props.initialIndex, props.items] as const,
    () => {
      if (props.visible) syncIndexOnOpen();
    },
    { deep: true }
  );

  const currentItem = computed(() => props.items[currentIndex.value]);
  const currentUrl = computed(() => currentItem.value?.url ?? '');

  const headerTitle = computed(() => {
    const item = currentItem.value;
    const name = item?.name?.trim();
    if (name) return name;
    if (currentUrl.value) {
      try {
        const path = new URL(currentUrl.value).pathname;
        const seg = path.split('/').filter(Boolean).pop();
        if (seg) return decodeURIComponent(seg);
      } catch {
        /* relative lub niepoprawny URL */
      }
    }
    return 'Podgląd pliku';
  });

  const counterLabel = computed(() => {
    const n = props.items.length;
    if (n === 0) return '';
    return `${currentIndex.value + 1} / ${n}`;
  });

  function isPdf(item: FilePreviewItem | undefined): boolean {
    if (!item?.url) return false;
    if (item.type?.toLowerCase().includes('pdf')) return true;
    const base = item.url.split('?')[0].toLowerCase();
    return base.endsWith('.pdf');
  }

  function isImage(item: FilePreviewItem | undefined): boolean {
    if (!item?.url) return false;
    const t = item.type?.toLowerCase() ?? '';
    if (t.includes('image')) return true;
    const base = item.url.split('?')[0].toLowerCase();
    return /\.(jpe?g|png|gif|webp|bmp|svg)$/.test(base);
  }

  /** PDF → iframe; pozostałe traktujemy jako obraz (wymagania: zdjęcia lub PDF). */
  const showPdf = computed(() => isPdf(currentItem.value));

  const showImage = computed(() => {
    const item = currentItem.value;
    if (!item) return false;
    if (isPdf(item)) return false;
    return isImage(item) || !item.type?.toLowerCase().includes('pdf');
  });

  const canGoPrev = computed(() => currentIndex.value > 0);
  const canGoNext = computed(() => currentIndex.value < props.items.length - 1);
  const hasMultiple = computed(() => props.items.length > 1);

  function goPrev() {
    if (canGoPrev.value) currentIndex.value -= 1;
  }

  function goNext() {
    if (canGoNext.value) currentIndex.value += 1;
  }

  function close() {
    emit('update:visible', false);
  }

  function openInNewTab() {
    const url = currentUrl.value;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  function onDialogVisibleUpdate(v: boolean) {
    emit('update:visible', v);
  }
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    class="w-[min(100vw-2rem,56rem)]"
    :header="headerTitle"
    :dismissable-mask="true"
    :close-on-escape="true"
    @update:visible="onDialogVisibleUpdate"
  >
    <div class="flex min-h-[12rem] flex-col gap-3">
      <div v-if="counterLabel" class="text-sm text-surface-600 dark:text-surface-400">
        {{ counterLabel }}
      </div>

      <div
        v-if="items.length === 0"
        class="flex flex-1 items-center justify-center rounded-lg border border-dashed border-surface-300 p-8 text-center text-surface-600 dark:border-surface-600 dark:text-surface-400"
      >
        Brak plików do wyświetlenia.
      </div>

      <template v-else>
        <div
          class="flex max-h-[min(70vh,720px)] min-h-[min(70vh,720px)] w-full items-center justify-center overflow-hidden rounded-lg bg-surface-100 dark:bg-surface-800"
        >
          <iframe
            v-if="showPdf && currentUrl"
            :src="currentUrl"
            :title="headerTitle"
            class="h-[min(70vh,720px)] w-full border-0"
          />
          <img
            v-else-if="showImage && currentUrl"
            :src="currentUrl"
            :alt="headerTitle"
            class="max-h-[min(70vh,720px)] w-full max-w-full object-contain"
          />
        </div>
      </template>
    </div>

    <template #footer>
      <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap gap-2">
          <OfficeButton
            v-if="hasMultiple"
            btn-type="office-regular"
            text="Poprzedni"
            icon="pi pi-chevron-left"
            icon-pos="left"
            :btn-disabled="!canGoPrev"
            @click="goPrev"
          />
          <OfficeButton
            v-if="hasMultiple"
            btn-type="office-regular"
            text="Następny"
            icon="pi pi-chevron-right"
            icon-pos="right"
            :btn-disabled="!canGoNext"
            @click="goNext"
          />
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          <OfficeButton
            v-if="items.length > 0 && currentUrl"
            btn-type="office-regular"
            text="Otwórz w nowej karcie"
            icon="pi pi-external-link"
            icon-pos="left"
            @click="openInNewTab"
          />
          <OfficeButton btn-type="office-regular" text="Zamknij" icon="pi pi-times" icon-pos="left" @click="close" />
        </div>
      </div>
    </template>
  </Dialog>
</template>
