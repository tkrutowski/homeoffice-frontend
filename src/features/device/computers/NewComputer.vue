<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import {useToast} from 'primevue/usetoast';
import {useUsersStore} from '@/stores/users';
import type {User} from '@/types/User';
import {
  type Computer,
  ComputerType,
  type DesktopComputer,
  isLaptop,
  type LaptopComputer,
} from '@/features/device/computers/types';
import {
  useCreateComputerMutation,
  useUpdateComputerMutation,
} from '@/features/device/computers/queries/useComputersMutations';
import type {AxiosError} from 'axios';
import OfficeButton from '@/components/OfficeButton.vue';

const props = defineProps<{
    visible: boolean;
    computer: Computer | null;
  }>();

  const emit = defineEmits<{
    (e: 'save'): void;
    (e: 'cancel'): void;
  }>();

  const userStore = useUsersStore();
  const createComputerMutation = useCreateComputerMutation();
  const updateComputerMutation = useUpdateComputerMutation();
  const toast = useToast();

  const selectedUser = ref<User | null>(null);
  const computerName = ref<string>('');
  const computerInfo = ref<string>('');
  const computerType = ref<'DESKTOP' | 'LAPTOP' | 'TABLET'>(ComputerType.DESKTOP);
  // Pola dla laptopa
  const laptopCpu = ref<string>('');
  const laptopGpu = ref<string>('');
  const laptopRam = ref<string>('');
  const laptopStorage = ref<string>('');
  const laptopDisplay = ref<string>('');
  const btnShowBusy = ref<boolean>(false);
  const submitted = ref<boolean>(false);

  const showError = (msg: string) => {
    toast.add({
      severity: 'error',
      summary: 'Błąd',
      detail: msg,
      life: 3000,
    });
  };

  const isNotValid = () => {
    return showErrorName() || showErrorUser();
  };

  const showErrorName = () => {
    return submitted.value && computerName.value.length === 0;
  };

  const showErrorUser = () => {
    return submitted.value && !selectedUser.value;
  };

  const resetForm = () => {
    computerName.value = '';
    computerInfo.value = '';
    computerType.value = ComputerType.DESKTOP;
    laptopCpu.value = '';
    laptopGpu.value = '';
    laptopRam.value = '';
    laptopStorage.value = '';
    laptopDisplay.value = '';
    selectedUser.value = null;
    submitted.value = false;
  };

  const closeDialog = () => {
    resetForm();
    emit('cancel');
  };

  // Load users if not loaded
  onMounted(async () => {
    if (userStore.users.length === 0) {
      await userStore.getUsersFromDb();
    }
  });

  // Watch for visibility changes to reset form
  watch(
    () => props.visible,
    newValue => {
      if (newValue && userStore.users.length === 0) {
        userStore.getUsersFromDb();
      }
    }
  );

  // Watch for computer changes to update form
  watch(
    () => props.computer,
    newComputer => {
      if (newComputer) {
        console.log('NewComputer - computer changed', newComputer);
        computerName.value = newComputer.name;
        computerInfo.value = newComputer.info ?? '';
        computerType.value = newComputer.computerType ?? ComputerType.DESKTOP;

        // Resetuj pola laptopa
        laptopCpu.value = '';
        laptopGpu.value = '';
        laptopRam.value = '';
        laptopStorage.value = '';
        laptopDisplay.value = '';

        // Jeśli to laptop, załaduj jego dane
        if (isLaptop(newComputer)) {
          laptopCpu.value = newComputer.cpu ?? '';
          laptopGpu.value = newComputer.gpu ?? '';
          laptopRam.value = newComputer.ram ?? '';
          laptopStorage.value = newComputer.storage ?? '';
          laptopDisplay.value = newComputer.display ?? '';
        }

        selectedUser.value = userStore.getUser(newComputer.idUser);
      } else {
        resetForm();
      }
    },
    { immediate: true }
  );

  const saveComputer = async () => {
    submitted.value = true;
    if (isNotValid()) {
      showError('Uzupełnij brakujące elementy');
      return;
    }

    btnShowBusy.value = true;
    let computer: Computer;

    if (props.computer) {
      // Podczas edycji aktualizujemy dane zależnie od typu
      if (computerType.value === ComputerType.LAPTOP) {
        computer = {
          ...(props.computer as LaptopComputer),
          name: computerName.value,
          idUser: selectedUser.value?.id || 0,
          info: computerInfo.value,
          computerType: ComputerType.LAPTOP,
          cpu: laptopCpu.value || undefined,
          gpu: laptopGpu.value || undefined,
          ram: laptopRam.value || undefined,
          storage: laptopStorage.value || undefined,
          display: laptopDisplay.value || undefined,
        };
      } else {
        computer = {
          ...(props.computer as DesktopComputer),
          name: computerName.value,
          idUser: selectedUser.value?.id || 0,
          info: computerInfo.value,
          computerType: ComputerType.DESKTOP,
        };
      }
    } else {
      // Dla nowego komputera
      if (computerType.value === ComputerType.LAPTOP) {
        computer = {
          idUser: selectedUser.value?.id || 0,
          name: computerName.value,
          activeStatus: 'ACTIVE',
          info: computerInfo.value,
          computerType: ComputerType.LAPTOP,
          cpu: laptopCpu.value || undefined,
          gpu: laptopGpu.value || undefined,
          ram: laptopRam.value || undefined,
          storage: laptopStorage.value || undefined,
          display: laptopDisplay.value || undefined,
        };
      } else {
        computer = {
          idUser: selectedUser.value?.id || 0,
          name: computerName.value,
          activeStatus: 'ACTIVE',
          computerCase: null,
          cooling: [],
          power: null,
          disk: [],
          display: [],
          keyboard: null,
          motherboard: null,
          mouse: null,
          ram: [],
          info: computerInfo.value,
          processor: null,
          soundCard: null,
          graphicCard: [],
          usb: [],
          computerType: ComputerType.DESKTOP,
        };
      }
    }

    try {
      if (props.computer) {
        await updateComputerMutation.mutateAsync(computer);
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Zaaktualizowano komputer: ' + computer.name,
          life: 3000,
        });
      } else {
        await createComputerMutation.mutateAsync(computer);
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Dodano nowy komputer: ' + computer.name,
          life: 3000,
        });
      }
      emit('save');
      closeDialog();
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 409) {
        toast.add({
          severity: 'warn',
          summary: 'Info',
          detail: 'Komputer o podanej nazwie już istnieje w bazie danych.',
          life: 3000,
        });
      } else {
        toast.add({
          severity: 'error',
          summary: axiosError?.message,
          detail: 'Błąd podczas zapisywania komputera.',
          life: 3000,
        });
      }
    } finally {
      btnShowBusy.value = false;
    }
  };
</script>

<template>
  <Dialog
    :visible="props.visible"
    :modal="true"
    :style="{ width: '500px' }"
    :header="props.computer ? 'Edycja komputera' : 'Nowy komputer'"
    class="p-fluid"
    @hide="closeDialog"
  >
    <div class="flex flex-col gap-4 p-4">
      <div class="field">
        <label class="font-medium mb-2 inline-block" for="name">Nazwa komputera</label>
        <InputText
          id="name"
          v-model="computerName"
          :invalid="showErrorName()"
          maxlength="200"
          placeholder="Wprowadź nazwę komputera"
        />
        <small class="text-red-500 block mt-1">{{ showErrorName() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
      </div>

      <div class="field">
        <label class="font-medium mb-2 inline-block" for="user">Użytkownik</label>
        <Select
          id="user"
          v-model="selectedUser"
          :invalid="showErrorUser()"
          :options="userStore.getUserByPrivileges"
          :option-label="user => user.firstName + ' ' + user.lastName"
          :loading="userStore.loadingUsers"
          placeholder="Wybierz użytkownika"
          class="w-full"
          required
        />
        <small class="text-red-500 block mt-1">{{ showErrorUser() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
      </div>

      <div class="field">
        <label class="font-medium mb-2 inline-block" for="type">Typ komputera</label>
        <Select
          id="type"
          v-model="computerType"
          :options="[
            { label: 'Desktop', value: ComputerType.DESKTOP },
            { label: 'Laptop', value: ComputerType.LAPTOP },
            { label: 'Tablet', value: ComputerType.TABLET },
          ]"
          option-label="label"
          option-value="value"
          placeholder="Wybierz typ komputera"
          class="w-full"
        />
      </div>

      <div v-if="computerType === ComputerType.LAPTOP" class="field">
        <label class="font-medium mb-2 inline-block">Specyfikacja laptopa (opcjonalnie)</label>
        <div class="flex flex-col gap-2">
          <InputText
            v-model="laptopCpu"
            placeholder="Procesor (np. Intel i7, AMD Ryzen 5)"
            maxlength="100"
          />
          <InputText
            v-model="laptopGpu"
            placeholder="Karta graficzna (np. RTX 3060, Intel Iris)"
            maxlength="100"
          />
          <InputText
            v-model="laptopRam"
            placeholder="Pamięć RAM (np. 16GB, 32GB)"
            maxlength="50"
          />
          <InputText
            v-model="laptopStorage"
            placeholder="Dysk (np. 512GB SSD, 1TB)"
            maxlength="100"
          />
          <InputText
            v-model="laptopDisplay"
            placeholder="Wyświetlacz (np. 15.6&quot; FHD, 14&quot; Retina)"
            maxlength="100"
          />
        </div>
      </div>

      <div class="field">
        <label class="font-medium mb-2 inline-block" for="info">Informacje</label>
        <Textarea
          id="info"
          v-model="computerInfo"
          rows="4"
          placeholder="Dodatkowe informacje o komputerze"
          class="w-full"
          autoResize
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 px-4 pb-4">
        <OfficeButton text="Anuluj" btn-type="office-regular" @click="closeDialog" />
        <OfficeButton text="Zapisz" btn-type="office-save" :loading="btnShowBusy" @click="saveComputer" />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
  :deep(.p-dialog-header) {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }

  :deep(.p-dialog-title) {
    font-size: 1.25rem;
    font-weight: 600;
  }

  :deep(.p-dialog-content) {
    padding: 0;
  }

  :deep(.p-inputtext),
  :deep(.p-dropdown) {
    width: 100%;
  }

  :deep(.p-button) {
    min-width: 6rem;
  }
</style>
