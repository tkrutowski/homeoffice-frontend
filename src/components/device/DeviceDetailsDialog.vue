<script setup lang="ts">
  import type { Device } from '@/types/Devices';
  import type { FileInfo } from '@/types/FileInfo';
  import type { DataTableRowClickEvent } from 'primevue';
  import { ref } from 'vue';
  import { FileService } from '@/service/FileService';
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

  function onFilesRowClick(event: DataTableRowClickEvent) {
    const file = event.data as FileInfo;
    if (!props.device?.files?.length) return;
    const idx = props.device.files.findIndex(f => f.id === file.id);
    filePreviewStartIndex.value = idx >= 0 ? idx : 0;
    filePreviewVisible.value = true;
  }

  function openFileUrlInNewTab(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
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
      <Fieldset v-if="device.files" class="w-full" legend="Pliki" :toggleable="true">
        <DataTable
          v-if="device.files.length > 0"
          :value="device.files"
          class="mt-4"
          :rows="10"
          :paginator="true"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          responsiveLayout="scroll"
          @row-click="onFilesRowClick"
        >
          <Column field="name" header="Nazwa pliku" :sortable="true">
            <template #body="slotProps">
              <div class="flex min-w-0 items-center gap-2">
                <i :class="FileService.getFileIcon(slotProps.data.type)" class="mr-2 shrink-0"></i>
                <span class="cursor-pointer truncate text-primary-600 dark:text-primary-400">
                  {{ slotProps.data.name }}
                </span>
                <OfficeIconButton
                  icon="pi pi-external-link"
                  class="shrink-0 text-blue-500"
                  title="Otwórz w nowej karcie"
                  @click.stop="openFileUrlInNewTab(slotProps.data.url)"
                />
              </div>
            </template>
          </Column>
          <Column field="type" header="Typ" :sortable="true" style="width: 150px">
            <template #body="slotProps">
              <Tag
                :value="FileService.getFileTypeLabel(slotProps.data.type)"
                :severity="FileService.getFileTypeSeverity(slotProps.data.type)"
              />
            </template>
          </Column>
          <Column field="size" header="Rozmiar" :sortable="true" style="width: 150px">
            <template #body="slotProps">
              {{ FileService.formatFileSize(slotProps.data.size) }}
            </template>
          </Column>
          <Column field="uploadDate" header="Data dodania" :sortable="true" style="width: 200px">
            <template #body="slotProps">
              {{ FileService.formatDate(slotProps.data.uploadDate) }}
            </template>
          </Column>
          <Column field="description" header="Opis" style="width: 200px">
            <template #body="slotProps">
              {{ slotProps.data.description }}
            </template>
          </Column>
        </DataTable>
      </Fieldset>

      <Fieldset class="w-full" legend="Szczegóły" :toggleable="true">
        <DataTable :value="Object.entries(device.details)" tableStyle="min-width: 50rem" size="small">
          <Column field="0" header="Klucz" style="width: 30%"></Column>
          <Column field="1" header="Wartość" style="width: 50%"></Column>
        </DataTable>
      </Fieldset>
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
