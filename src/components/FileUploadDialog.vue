<script setup lang="ts">
  import type { FileInfo, Module } from '@/types/FileInfo';
  import OfficeButton from '@/components/OfficeButton.vue';
  import { computed, type DefineComponent, type PropType, ref, watch } from 'vue';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import { useFilesStore } from '@/stores/files.ts';
  import { useToast } from 'primevue/usetoast';
  import { FileService } from '@/service/FileService.ts';
  import type { FileUploadUploaderEvent } from 'primevue/fileupload';

  const props = defineProps({
    visible: {
      type: Boolean,
      required: true,
    },
    module: {
      type: String as PropType<Module>,
      required: true,
    },
  });

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'save', files: FileInfo[]): void;
    (e: 'cancel'): void;
  }>();

  const updateVisibility = (value: boolean) => {
    emit('update:visible', value);
  };
  const closeDialog = () => {
    updateVisibility(false);
    emit('cancel');
  };

  const saveFiles = () => {
    console.log('DIALOG save files', uploadedFiles.value);
    emit('save', uploadedFiles.value);
    updateVisibility(false);
  };

  // Funkcja resetująca stan
  const resetDialog = () => {
    uploadedFiles.value = [];
    fileToDelete.value = null;
    showDeleteFileDialog.value = false;
  };

  // Watch na zmianę widoczności
  watch(
    () => props.visible,
    newValue => {
      if (newValue) {
        resetDialog();
      }
    }
  );

  const fileStore = useFilesStore();
  const toast = useToast();
  const uploadedFiles = ref<FileInfo[]>([]);
  const showDeleteFileDialog = ref<boolean>(false);

  const deleteFileMessage = computed(() => {
    return fileToDelete.value ? `Czy na pewno chcesz usunąć plik "${fileToDelete.value.name}"?` : '';
  });

  const uploaderRef = ref<DefineComponent | null>(null);
  const uploadFile = async (event: FileUploadUploaderEvent) => {
    console.log('uploadFile event', event);
    try {
      const files = Array.isArray(event.files) ? event.files : [event.files];

      for (const file of files) {
        const localFormData = new FormData();

        // Dodajemy plik do lokalnej kopii
        localFormData.append('file', file);
        try {
          const response = await fileStore.addFileDb(props.module, localFormData);
          uploadedFiles.value.push(response);
          //Wyświetla pliki w statusie Ukończony
          // uploaderRef.value?.uploadedFiles.push(file)
          // console.log("uploadedFiles",uploaderRef.value?.uploadedFiles)
        } catch (error) {
          uploaderRef.value?.files.push(file);
          throw error; // Przekazujemy błąd dalej
        }
      }
      toast.add({
        severity: 'success',
        summary: 'Sukces',
        detail: 'Pliki zostały wgrane',
        life: 3000,
      });
    } catch (error) {
      console.log('error', error);
      toast.add({
        severity: 'error',
        summary: 'Błąd',
        detail: 'Nie udało się wgrać plików',
        life: 3000,
      });
    }
  };

  // -------------------------------------------DOWNLOAD--------------------------------
  const downloadFile = (file: FileInfo) => {
    console.log('downloadFile', file);
    window.open(file.url, '_blank');
  };

  // -------------------------------------------DELETE--------------------------------
  const fileToDelete = ref<FileInfo | null>(null);
  // Metoda do potwierdzenia usunięcia
  const confirmDeleteFile = (file: FileInfo) => {
    fileToDelete.value = file;
    showDeleteFileDialog.value = true;
  };

  // Metoda do usuwania pliku
  const deleteFile = async () => {
    if (!fileToDelete.value) return;
    try {
      await fileStore.deleteFileDb(props.module, fileToDelete.value?.name);
      if (uploadedFiles.value.length > 0 && fileToDelete.value) {
        uploadedFiles.value = uploadedFiles.value.filter(f => f.name !== fileToDelete.value!.name);
      }

      showDeleteFileDialog.value = false;
      fileToDelete.value = null;

      toast.add({
        severity: 'success',
        summary: 'Sukces',
        detail: 'Plik został usunięty',
        life: 3000,
      });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Błąd',
        detail: 'Nie udało się usunąć pliku',
        life: 3000,
      });
    }
  };
</script>

<template>
  <Dialog
    v-model:visible="props.visible"
    modal
    header="Wgraj pliki"
    :style="{ width: '70vw' }"
    :dismissableMask="true"
    :closeOnEscape="true"
  >
    <Fieldset class="w-full" legend="Pliki" :toggleable="true">
      <div class="mb-4">
        <FileUpload
          ref="uploaderRef"
          :multiple="true"
          :maxFileSize="10000000"
          :customUpload="true"
          @uploader="uploadFile"
          chooseLabel="Wybierz plik"
          uploadLabel="Wgraj"
          cancelLabel="Anuluj"
        >
          <template #empty>
            <p>Przeciągnij i upuść pliki tutaj aby je wgrać.</p>
            <p class="mt-2 text-sm text-gray-500">Maksymalny rozmiar pliku: 10MB</p>
          </template>
        </FileUpload>
      </div>

      <div class="border bottom-1 rounded">
        <DataTable
          v-if="uploadedFiles.length > 0"
          :value="uploadedFiles"
          class="mt-4"
          :rows="10"
          :paginator="true"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          responsiveLayout="scroll"
        >
          <Column field="name" header="Nazwa pliku" sortable>
            <template #body="slotProps">
              <div class="flex items-center">
                <i :class="FileService.getFileIcon(slotProps.data.type)" class="mr-2"></i>
                <a :href="slotProps.data.url" target="_blank" class="text-blue-600 hover:text-blue-800">
                  {{ slotProps.data.name }}
                </a>
              </div>
            </template>
          </Column>
          <Column field="type" header="Typ" sortable style="width: 150px">
            <template #body="slotProps">
              <Tag
                :value="FileService.getFileTypeLabel(slotProps.data.type)"
                :severity="FileService.getFileTypeSeverity(slotProps.data.type)"
              />
            </template>
          </Column>
          <Column field="size" header="Rozmiar" sortable style="width: 150px">
            <template #body="slotProps">
              {{ FileService.formatFileSize(slotProps.data.size) }}
            </template>
          </Column>
          <Column field="uploadDate" header="Data dodania" sortable style="width: 200px">
            <template #body="slotProps">
              {{ FileService.formatDate(slotProps.data.uploadDate) }}
            </template>
          </Column>
          <Column field="description" header="Opis" style="width: 200px">
            <template #body="slotProps">
              <InputText v-model="slotProps.data.description" placeholder="Dodaj opis..." />
            </template>
          </Column>
          <Column header="Akcje" style="width: 100px">
            <template #body="slotProps">
              <div class="flex gap-2">
                <OfficeIconButton class="text-blue-500" icon="pi pi-download" @click="downloadFile(slotProps.data)" />
                <OfficeIconButton class="text-red-500" icon="pi pi-trash" @click="confirmDeleteFile(slotProps.data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
      <ConfirmationDialog
        v-model:visible="showDeleteFileDialog"
        :msg="deleteFileMessage"
        label="Usuń"
        @save="deleteFile"
        @cancel="showDeleteFileDialog = false"
      />
    </Fieldset>
    <template #footer>
      <div class="flex justify-end gap-2">
        <OfficeButton btnType="office-regular" text="Anuluj" icon="pi pi-times" @click="closeDialog" />
        <OfficeButton
          btnType="office-save"
          :btn-disabled="uploadedFiles.length === 0"
          text="Zapisz"
          icon="pi pi-check"
          @click="saveFiles"
        />
      </div>
    </template>
  </Dialog>
</template>
<style scoped>
  /* Dodaj do istniejących stylów */
  :deep(.p-fileupload) {
    width: 100%;
  }

  :deep(.p-fileupload-content) {
    padding: 2rem;
  }

  :deep(.p-fileupload-file-info) {
    width: 200px;
  }

  .file-icon {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }
</style>
