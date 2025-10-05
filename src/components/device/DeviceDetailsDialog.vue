<script setup lang="ts">
  import type { DeviceDto } from '@/types/Devices';
  import { FileService } from '@/service/FileService';
  import OfficeButton from '@/components/OfficeButton.vue';

  defineProps<{
    device: DeviceDto | null;
  }>();

</script>

<template>
  <Dialog
    :header="`Szczegóły urządzenia: ${device?.name}`"
    :style="{ width: '70vw' }"
    :maximizable="true"
    :modal="true"
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
              {{ slotProps.data.description }}
            </template>
          </Column>
        </DataTable>
      </Fieldset>

      <Fieldset class="w-full" legend="Szczegóły" :toggleable="true">
        <DataTable :value="Array.from(device.details)" tableStyle="min-width: 50rem" size="small">
          <Column field="0" header="Klucz" style="width: 40%"></Column>
          <Column field="1" header="Wartość" style="width: 40%"></Column>
        </DataTable>
      </Fieldset>
    </div>
    <template #footer>
      <div class="flex justify-end">
        <OfficeButton btn-type="office-regular" text="OK" icon="pi pi-check" icon-pos="left" />
      </div>
    </template>
  </Dialog>
</template>
