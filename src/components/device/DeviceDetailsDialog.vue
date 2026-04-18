<script setup lang="ts">
  import type { Device } from '@/types/Devices';
  import type { FileInfo } from '@/types/FileInfo';
  import { computed, ref } from 'vue';
  import { FileService } from '@/service/FileService';
  import { UtilsService } from '@/service/UtilsService';
  import OfficeButton from '@/components/OfficeButton.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import FileUrlsPreviewDialog from '@/components/FileUrlsPreviewDialog.vue';

  const visible = defineModel<boolean>('visible', { required: true });

  const props = defineProps<{
    device: Device | null;
  }>();

  const closeDialog = () => {
    visible.value = false;
  };

  const filePreviewVisible = ref(false);

  function onDetailsDialogHide() {
    filePreviewVisible.value = false;
  }
  const filePreviewStartIndex = ref(0);

  function onFileCardClick(file: FileInfo) {
    if (!props.device?.files?.length) return;
    const idx = props.device.files.findIndex(f => f.id === file.id);
    filePreviewStartIndex.value = idx >= 0 ? idx : 0;
    filePreviewVisible.value = true;
  }

  function openFileUrlInNewTab(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function formatFileUploadDate(d: Date | null | undefined): string {
    if (d == null) return '—';
    return FileService.formatDate(d);
  }

  const detailsEntries = computed<[string, string][]>(() => {
    if (!props.device?.details) return [];

    if (props.device.details instanceof Map) {
      return Array.from(props.device.details.entries()).map(([key, value]) => [key, value ?? '—']);
    }

    return Object.entries(props.device.details as Record<string, string>).map(([key, value]) => [key, value ?? '—']);
  });

  function isImageFile(file: FileInfo): boolean {
    return file.type?.includes('image') ?? false;
  }
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="`Szczegóły urządzenia: ${device?.name}`"
    :style="{ width: '70vw' }"
    :maximizable="true"
    :modal="true"
    :closable="true"
    :close-on-escape="true"
    @hide="onDetailsDialogHide"
  >
    <div v-if="device" class="flex flex-col gap-4">
      <Fieldset class="w-full" legend="Kwoty i daty" :toggleable="true">
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch">
            <div
              class="flex h-full min-h-0 flex-col gap-2 rounded-2xl border border-surface-200 border-l-4 border-l-primary bg-surface-0 p-4 shadow-sm dark:border-surface-700 dark:bg-surface-900"
            >
              <span class="text-xs font-semibold uppercase tracking-wide text-primary">Kwota zakupu</span>
              <div class="text-2xl font-semibold leading-tight text-surface-900 dark:text-surface-0 sm:text-3xl">
                {{ UtilsService.formatCurrency(device.purchaseAmount ?? undefined) ?? '—' }}
              </div>
              <div class="mt-auto flex items-center gap-2 text-xs text-surface-600 dark:text-surface-400">
                <i class="pi pi-calendar shrink-0 text-primary" />
                <span>Data zakupu: {{ UtilsService.formatDateToString(device.purchaseDate ?? undefined) || '—' }}</span>
              </div>
            </div>

            <div
              class="flex h-full min-h-0 flex-col gap-2 rounded-2xl border border-surface-200 border-l-4 border-l-primary bg-surface-0 p-4 shadow-sm dark:border-surface-700 dark:bg-surface-900"
            >
              <span class="text-xs font-semibold uppercase tracking-wide text-primary">Sprzedaż</span>
              <div class="text-2xl font-semibold leading-tight text-surface-900 dark:text-surface-0 sm:text-3xl">
                {{ UtilsService.formatCurrency(device.sellAmount ?? undefined) ?? '—' }}
              </div>
              <div class="mt-auto flex items-center gap-2 text-xs text-surface-600 dark:text-surface-400">
                <i class="pi pi-calendar shrink-0 text-primary" />
                <span>Data sprzedaży: {{ UtilsService.formatDateToString(device.sellDate ?? undefined) || '—' }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch">
            <div
              class="flex h-full min-h-0 flex-col gap-2 rounded-2xl border border-surface-200 border-l-4 border-l-primary bg-surface-0 p-4 shadow-sm dark:border-surface-700 dark:bg-surface-900"
            >
              <span class="text-xs font-semibold uppercase tracking-wide text-primary">Rodzaj urządzenia</span>
              <p class="text-sm leading-snug text-surface-900 dark:text-surface-0">
                {{ device.deviceType?.name ?? '—' }}
              </p>
            </div>
            <div
              class="flex h-full min-h-0 flex-col gap-2 rounded-2xl border border-surface-200 border-l-4 border-l-primary bg-surface-0 p-4 shadow-sm dark:border-surface-700 dark:bg-surface-900"
            >
              <span class="text-xs font-semibold uppercase tracking-wide text-primary">Firma</span>
              <p class="text-sm leading-snug text-surface-900 dark:text-surface-0">
                {{ device.firm?.name ?? '—' }}
              </p>
            </div>
            <div
              class="flex h-full min-h-0 flex-col gap-2 rounded-2xl border border-surface-200 border-l-4 border-l-primary bg-surface-0 p-4 shadow-sm dark:border-surface-700 dark:bg-surface-900"
            >
              <span class="text-xs font-semibold uppercase tracking-wide text-primary">Gwarancja do</span>
              <div class="flex items-center gap-2 text-sm text-surface-900 dark:text-surface-0">
                <i class="pi pi-shield shrink-0 text-primary" />
                <span>{{ UtilsService.formatDateToString(device.warrantyEndDate ?? undefined) || '—' }}</span>
              </div>
            </div>
            <div
              class="flex h-full min-h-0 flex-col gap-2 rounded-2xl border border-surface-200 border-l-4 border-l-primary bg-surface-0 p-4 shadow-sm dark:border-surface-700 dark:bg-surface-900"
            >
              <span class="text-xs font-semibold uppercase tracking-wide text-primary">Ubezpieczenie do</span>
              <div class="flex items-center gap-2 text-sm text-surface-900 dark:text-surface-0">
                <i class="pi pi-shield shrink-0 text-primary" />
                <span>{{ UtilsService.formatDateToString(device.insuranceEndDate ?? undefined) || '—' }}</span>
              </div>
            </div>
          </div>

          <div
            class="flex min-h-0 flex-col gap-2 rounded-2xl border border-surface-200 border-l-4 border-l-primary bg-surface-0 p-4 shadow-sm dark:border-surface-700 dark:bg-surface-900"
          >
            <span class="text-xs font-semibold uppercase tracking-wide text-primary">Dodatkowe informacje</span>
            <p
              v-if="device.otherInfo?.trim()"
              class="whitespace-pre-wrap text-sm leading-relaxed text-surface-900 dark:text-surface-0"
            >
              {{ device.otherInfo }}
            </p>
            <p v-else class="text-sm text-surface-600 dark:text-surface-400">—</p>
          </div>
        </div>
      </Fieldset>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Fieldset v-if="device.files" class="h-full w-full" legend="Pliki" :toggleable="true">
          <div v-if="device.files.length > 0" class="mt-4 flex max-h-[26rem] flex-col gap-3 overflow-y-auto pr-1">
            <div
              v-for="file in device.files"
              :key="file.id"
              class="flex cursor-pointer items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 p-3 transition-colors hover:bg-surface-100 dark:border-surface-700 dark:bg-surface-900 dark:hover:bg-surface-800"
              @click="onFileCardClick(file)"
            >
              <div
                class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-200 bg-surface-100 dark:border-surface-700 dark:bg-surface-800"
              >
                <img
                  v-if="isImageFile(file) && file.url"
                  :src="file.url"
                  :alt="file.name"
                  class="h-full w-full object-cover"
                />
                <i v-else :class="FileService.getFileIcon(file.type)" class="text-xl text-primary" />
              </div>

              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-surface-900 dark:text-surface-0">{{ file.name }}</p>
                <p class="text-xs text-surface-600 dark:text-surface-400">
                  {{ FileService.getFileTypeLabel(file.type) }}
                </p>
                <p class="text-xs text-surface-600 dark:text-surface-400">
                  {{ FileService.formatFileSize(file.size) }} · {{ formatFileUploadDate(file.uploadDate) }}
                </p>
                <p v-if="file.description?.trim()" class="truncate text-xs text-surface-500 dark:text-surface-400">
                  {{ file.description }}
                </p>
              </div>

              <OfficeIconButton
                icon="pi pi-external-link"
                class="shrink-0 text-primary"
                title="Otwórz w nowej karcie"
                @click.stop="openFileUrlInNewTab(file.url)"
              />
            </div>
          </div>
          <div
            v-else
            class="mt-4 rounded-xl border border-surface-200 p-4 text-sm text-surface-600 dark:border-surface-700 dark:text-surface-400"
          >
            Brak plików do wyświetlenia.
          </div>
        </Fieldset>

        <Fieldset class="h-full w-full" legend="Szczegóły" :toggleable="true">
          <div
            v-if="detailsEntries.length > 0"
            class="mt-4 flex max-h-[26rem] flex-col overflow-y-auto rounded-xl border border-surface-200 dark:border-surface-700"
          >
            <div
              v-for="[key, value] in detailsEntries"
              :key="key"
              class="flex flex-col gap-1.5 border-b border-surface-200 px-3 py-2.5 last:border-b-0 dark:border-surface-700"
            >
              <span class="text-xs font-medium text-surface-500 dark:text-surface-400">{{ key }}</span>
              <span class="break-words text-sm font-semibold text-surface-900 dark:text-surface-0">{{
                value || '—'
              }}</span>
            </div>
          </div>
          <div
            v-else
            class="mt-4 rounded-xl border border-surface-200 p-4 text-sm text-surface-600 dark:border-surface-700 dark:text-surface-400"
          >
            Brak szczegółów do wyświetlenia.
          </div>
        </Fieldset>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end">
        <OfficeButton btn-type="office-regular" text="OK" icon="pi pi-check" icon-pos="left" @click="closeDialog" />
      </div>
    </template>
  </Dialog>

  <FileUrlsPreviewDialog
    v-model:visible="filePreviewVisible"
    :items="device?.files ?? []"
    :initial-index="filePreviewStartIndex"
  />
</template>
