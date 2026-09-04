<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import OfficeButton from '@/components/OfficeButton.vue';
  import { useToast } from 'primevue/usetoast';
  import type { Device } from '@/features/device/devices/types';
  import TheMenuDevice from '@/features/device/_shared/TheMenuDevice.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import { UtilsService } from '@/service/UtilsService';
  import {
    isLaptop,
    isDesktop,
    type ComponentType,
    type Computer,
    type DesktopComputer,
  } from '@/features/device/computers/types';
  import ComponentCategory from '@/features/device/computers/ComponentCategory.vue';
  import DeviceDetails from '@/features/device/computers/DeviceDetails.vue';
  import AddAutoComplete from '@/components/AddAutoCompleteDialog.vue';
  import type { SelectChangeEvent } from 'primevue/select';
  import type { AxiosError } from 'axios';
  import NewComputer from '@/features/device/computers/NewComputer.vue';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import { useComputersListQuery } from '@/features/device/computers/queries/useComputersQueries';
  import {
    useDeleteComputerMutation,
    useUpdateComputerMutation,
  } from '@/features/device/computers/queries/useComputersMutations';
  import { useDevicesListQuery } from '@/features/device/devices/queries/useDevicesQueries';
  import { fetchComputer } from '@/features/device/computers/api/computersApi';
  import { fetchDevice } from '@/features/device/devices/api/devicesApi';
  import { COMPONENT_TYPES } from '@/features/device/computers/componentTypes';
  import { cloneComputer } from '@/features/device/_shared/cloneEntities';

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();

  const { data: computersData, isFetching: loadingComputers, refetch: refetchComputers } = useComputersListQuery();
  const { data: devicesData, isFetching: loadingDevices } = useDevicesListQuery();
  const updateComputerMutation = useUpdateComputerMutation();
  const deleteComputerMutation = useDeleteComputerMutation();

  const computers = computed(() => computersData.value ?? []);

  const deviceDetailsMap = ref<Map<ComponentType, Device[]>>(new Map<ComponentType, Device[]>());
  const selectedComputer = ref<Computer | null>(null);

  /** Opcja z listy Query (Select porównuje po referencji). */
  const selectedComputerOption = computed(() =>
    selectedComputer.value ? (computers.value.find(c => c.id === selectedComputer.value!.id) ?? null) : null
  );

  onMounted(async () => {
    await syncComputerFromRoute();
  });

  watch(
    () => route.query.id,
    () => {
      void syncComputerFromRoute();
    }
  );

  watch(computers, () => {
    void syncComputerFromRoute();
  });
  const hasChange = ref<boolean>(false);
  const updating = ref<boolean>(false);

  const isLaptopComputer = computed(() => {
    return selectedComputer.value ? isLaptop(selectedComputer.value) : false;
  });

  //refresh view
  const refreshKey = ref<boolean>(false);

  function parseComputerIdFromQuery(raw: unknown): number | null {
    if (raw == null || raw === '') return null;
    const id = Number(Array.isArray(raw) ? raw[0] : raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  function resetComputerViewState() {
    refreshKey.value = false;
    hasChange.value = false;
    deviceDetailsMap.value = new Map<ComponentType, Device[]>();
  }

  async function selectComputer(computer: Computer | null) {
    resetComputerViewState();

    if (!computer) {
      selectedComputer.value = null;
      return;
    }

    selectedComputer.value = cloneComputer(computer);

    if (computer.id) {
      const fullComputer = await fetchComputer(computer.id, computer.computerType as 'DESKTOP' | 'LAPTOP');
      if (fullComputer) {
        selectedComputer.value = cloneComputer(fullComputer);
      }
    }

    setTimeout(() => {
      refreshKey.value = true;
    }, 300);
  }

  async function selectComputerById(id: number) {
    if (computers.value.length === 0) {
      await refetchComputers();
    }

    const computer = computers.value.find(c => c.id === id);
    if (!computer) {
      toast.add({
        severity: 'warn',
        summary: 'Komputer',
        detail: 'Nie znaleziono komputera o podanym identyfikatorze.',
        life: 4000,
      });
      await router.replace({ name: 'Computers' });
      return;
    }

    await selectComputer(computer);
  }

  async function syncComputerFromRoute() {
    const id = parseComputerIdFromQuery(route.query.id);
    if (id == null) {
      if (selectedComputer.value != null) {
        await selectComputer(null);
      }
      return;
    }
    if (selectedComputer.value?.id === id) return;
    if (computers.value.length === 0 && loadingComputers.value) return;
    await selectComputerById(id);
  }

  async function selectedComputerChanged(event: SelectChangeEvent) {
    console.log('selectedComputerChanged', event);

    const computer =
      event.value && typeof event.value === 'object' && 'id' in event.value ? (event.value as Computer) : null;

    await selectComputer(computer);

    if (computer) {
      await router.replace({ name: 'Computers', query: { id: String(computer.id) } });
    } else {
      await router.replace({ name: 'Computers' });
    }
  }

  //
  //---------------------------------------------------------NEW COMPUTER----------------------------------------------
  //
  const showAddComputerModal = ref<boolean>(false);
  const showEditComputerModal = ref<boolean>(false);

  //
  //-----------------------------------------------------EDIT COMPUTER------------------------------------------------
  //
  async function updateComputer() {
    console.log('updateComputer()');
    if (selectedComputer.value != null) {
      hasChange.value = false;
      updating.value = true;
      try {
        await updateComputerMutation.mutateAsync(selectedComputer.value);
        if (selectedComputer.value.id) {
          const updatedComputer = await fetchComputer(
            selectedComputer.value.id,
            selectedComputer.value.computerType as 'DESKTOP' | 'LAPTOP'
          );
          if (updatedComputer) {
            selectedComputer.value = cloneComputer(updatedComputer);
          }
        }

        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Zaaktualizowano komputer: ' + selectedComputer.value?.name,
          life: 3000,
        });
      } catch (reason) {
        const axiosError = reason as AxiosError;
        toast.add({
          severity: 'error',
          summary: axiosError?.message,
          detail: 'Błąd podczas edycji komputera.',
          life: 3000,
        });
        hasChange.value = true;
      } finally {
        updating.value = false;
      }
    }
  }

  //
  //CATEGORY
  //
  const addToDisplayMap = async (componentType: ComponentType) => {
    console.log('START - addToDisplayMap dla typu:', componentType.name);

    if (selectedComputer.value != null && isDesktop(selectedComputer.value)) {
      const desktop = selectedComputer.value as DesktopComputer;
      const oneDeviceOrListOfDevices: any = (desktop as any)[componentType.column];

      let devices: Device[] = [];

      if (Array.isArray(oneDeviceOrListOfDevices)) {
        devices = oneDeviceOrListOfDevices;
      } else if (oneDeviceOrListOfDevices) {
        devices.push(oneDeviceOrListOfDevices);
      }

      deviceDetailsMap.value.set(componentType, devices);
    } else {
      console.log('Brak wybranego komputera lub to laptop');
    }

    console.log('KONIEC - addToDisplayMap');
  };

  const removeFromDisplayMap = async (componentType: ComponentType) => {
    deviceDetailsMap.value.delete(componentType);
  };

  //
  //DISPLAY
  //
  const selectedDevicesCost = computed(() => {
    return Array.from(deviceDetailsMap.value.values())
      .flat()
      .map((device: Device) => device.purchaseAmount)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  });

  const showAddModal = ref<boolean>(false);
  const message = ref<string>('');
  const componentType = ref<ComponentType | null>(null);

  function openAddComponentDialog(compType: ComponentType) {
    console.log('openAddComponentDialog', compType);
    message.value = compType.viewName;
    componentType.value = compType;
    showAddModal.value = true;
  }

  async function addComponent(id: number) {
    showAddModal.value = false;

    if (selectedComputer.value !== null && componentType.value !== null && isDesktop(selectedComputer.value)) {
      const device = await fetchDevice(id);

      if (!device) {
        console.error('Nie znaleziono urządzenia o ID:', id);
        return;
      }

      const desktop = selectedComputer.value as DesktopComputer;
      let columnValue: any = (desktop as any)[componentType.value.column];

      if (
        componentType.value.column === 'ram' ||
        componentType.value.column === 'disk' ||
        componentType.value.column === 'cooling' ||
        componentType.value.column === 'display' ||
        componentType.value.column === 'graphicCard' ||
        componentType.value.column === 'usb'
      ) {
        const arr = columnValue as Device[];
        const deviceExists = arr.some(d => d.id === id);

        if (!deviceExists) {
          arr.push(device);
          (desktop as any)[componentType.value.column] = [...arr];
          selectedComputer.value = { ...desktop };
        }
      } else {
        (desktop as any)[componentType.value.column] = device;
        selectedComputer.value = { ...desktop };
      }

      if (deviceDetailsMap.value.has(componentType.value)) {
        const existingDevices: Device[] = deviceDetailsMap.value.get(componentType.value) || [];

        if (!existingDevices.includes(device)) {
          existingDevices.push(device);
        }
        deviceDetailsMap.value.set(componentType.value, existingDevices);
      }

      hasChange.value = true;
      console.log('Ustawiono flagę zmiany');
    }
  }

  function removeComponent(part: ComponentType, device: Device) {
    console.log('removeComponent', part, device);
    if (selectedComputer.value !== null && isDesktop(selectedComputer.value)) {
      // Usuwamy z selectedComputer
      const desktop = selectedComputer.value as DesktopComputer;
      const arrayFields = ['ram', 'disk', 'cooling', 'display', 'graphicCard', 'usb'] as const;

      if (arrayFields.includes(part.column as (typeof arrayFields)[number])) {
        // To są tablice Device[]
        const arr = (desktop as any)[part.column] as Device[];
        const index = arr.findIndex(d => d.id === device.id);
        if (index !== -1) {
          arr.splice(index, 1);
          (desktop as any)[part.column] = [...arr];
          selectedComputer.value = { ...desktop };
        }
      } else {
        // To są pojedyncze Device - ustawiamy na null
        (desktop as any)[part.column] = null;
        selectedComputer.value = { ...desktop };
      }

      // Usuwamy z displayMap
      if (deviceDetailsMap.value.has(part)) {
        const existingDevices = deviceDetailsMap.value.get(part) || [];
        const index = existingDevices.findIndex(dev => dev.id === device.id);
        if (index !== -1) {
          existingDevices.splice(index, 1);
          deviceDetailsMap.value.set(part, [...existingDevices]); // Tworzymy nową tablicę aby wymusić reaktywność
        }
      }
      hasChange.value = true;
    }
  }

  const devices = computed(() => {
    return (devicesData.value ?? [])
      .filter((dev: Device) => dev.activeStatus === 'ACTIVE')
      .map((dev: Device) => {
        return {
          id: dev.id,
          name: dev.name,
        };
      });
  });

  const handleSave = async () => {
    const currentComputerId = selectedComputer.value?.id;
    if (currentComputerId) {
      const updated = computers.value.find(comp => comp.id === currentComputerId) || null;
      if (updated) {
        selectedComputer.value = cloneComputer(updated);
      }
    }
  };

  const handleCancel = () => {
    showAddComputerModal.value = false;
    showEditComputerModal.value = false;
  };

  const showDeleteConfirmation = ref<boolean>(false);

  async function deleteComputer() {
    if (selectedComputer.value && selectedComputer.value.id) {
      const name = selectedComputer.value.name;
      try {
        await deleteComputerMutation.mutateAsync(selectedComputer.value.id);
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Usunięto komputer: ' + name,
          life: 3000,
        });
        selectedComputer.value = null;
        void router.replace({ name: 'Computers' });
      } catch (reason) {
        const axiosError = reason as AxiosError;
        toast.add({
          severity: 'error',
          summary: axiosError?.message,
          detail: 'Nie udało się usunąć komputera',
          life: 3000,
        });
      }
    }
    showDeleteConfirmation.value = false;
  }
</script>

<template>
  <AddAutoComplete
    v-model:visible="showAddModal"
    :msg="message"
    :object-list="devices"
    @cancel="() => (showAddModal = false)"
    @save="addComponent"
  />
  <NewComputer v-model:visible="showAddComputerModal" :computer="null" @save="handleSave" @cancel="handleCancel" />
  <NewComputer
    v-model:visible="showEditComputerModal"
    :computer="selectedComputer"
    @save="handleSave"
    @cancel="handleCancel"
  />
  <ConfirmationDialog
    v-model:visible="showDeleteConfirmation"
    msg="Czy na pewno chcesz usunąć wybrany komputer?"
    label="Usuń"
    @save="deleteComputer"
    @cancel="() => (showDeleteConfirmation = false)"
  />

  <MainPageShell :scroll-default-slot="false">
    <template #top>
      <TheMenuDevice />
    </template>

    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <Toolbar class="shrink-0 m-6 mb-0">
        <template #start>
          <OfficeButton
            btn-type="office-regular"
            text="Nowy"
            icon-pos="left"
            icon="pi pi-plus"
            size="small"
            @click="showAddComputerModal = true"
          />
          <OfficeButton
            class="ml-2"
            btn-type="office-regular"
            text="Edycja"
            icon-pos="left"
            icon="pi pi-pencil"
            size="small"
            @click="showEditComputerModal = true"
            :disabled="selectedComputer == null"
          />
          <OfficeButton
            class="ml-2"
            btn-type="office-save"
            text="Usuń"
            icon-pos="left"
            icon="pi pi-trash"
            size="small"
            @click="showDeleteConfirmation = true"
            :disabled="selectedComputer == null"
          />
        </template>

        <template #center>
          <Select
            :modelValue="selectedComputerOption"
            :options="computers"
            optionLabel="name"
            placeholder="Wybierz komputer"
            :loading="loadingComputers"
            @change="selectedComputerChanged"
          />
        </template>

        <template #end>
          <OfficeButton
            btn-type="office-save"
            text="zapisz"
            :btn-disabled="!hasChange"
            icon="pi pi-save"
            size="small"
            class="mr-2"
            :loading="updating"
            @click="updateComputer"
          />
        </template>
      </Toolbar>

      <div v-if="selectedComputer" class="flex min-h-0 min-w-0 flex-1 gap-4 m-6 mt-4 overflow-hidden">
        <Card class="categories-card flex min-h-0 min-w-96 flex-1 flex-col overflow-hidden">
          <template #title>
            <div class="flex justify-center">
              <span class="font-bold text-2xl">Kategorie</span>
            </div>
          </template>
          <template #content>
            <div class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              <div v-if="isLaptopComputer" class="flex items-center justify-center h-full">
                <div class="text-center text-surface-600 dark:text-surface-400">
                  <i class="pi pi-info-circle text-2xl text-amber-600 mb-2 block" />
                  <p>Laptopy mają wbudowaną specyfikację techniczną</p>
                </div>
              </div>
              <div v-else-if="refreshKey">
                <div v-for="type in COMPONENT_TYPES" :key="type.name">
                  <ComponentCategory
                    :componentType="type"
                    :computer="selectedComputer"
                    @addView="addToDisplayMap"
                    @removeView="removeFromDisplayMap"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>

        <Panel class="details-panel flex min-h-0 w-full min-w-0 flex-col overflow-hidden">
          <template #header>
            <div class="w-full flex justify-center gap-4">
              <span class="font-bold text-3xl ml-2 text-color"
                >Wybrane kategorie: {{ UtilsService.formatCurrency(selectedDevicesCost) }}</span
              >
              <div v-if="loadingDevices || loadingComputers">
                <ProgressSpinner style="width: 35px; height: 35px" stroke-width="5" />
              </div>
            </div>
          </template>
          <div class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div v-for="[category, devices] in deviceDetailsMap" :key="category.name">
              <DeviceDetails
                :component-type="category"
                :devices="devices"
                @add="openAddComponentDialog"
                @remove="removeComponent"
                class="mb-5"
              />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  </MainPageShell>
</template>

<style scoped>
  :deep(.categories-card.p-card) {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
  :deep(.categories-card .p-card-body) {
    flex: 1 1 0%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  :deep(.categories-card .p-card-content) {
    flex: 1 1 0%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  :deep(.details-panel.p-panel) {
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }
  :deep(.details-panel .p-panel-content-container) {
    flex: 1 1 0%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  :deep(.details-panel .p-panel-content) {
    flex: 1 1 0%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
