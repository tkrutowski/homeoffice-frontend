<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { FilterMatchMode } from '@primevue/core/api';
  import router from '@/router';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import { useToast } from 'primevue/usetoast';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import type { AxiosError } from 'axios';
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import { useBanksStore } from '@/stores/banks.ts';
  import type { Bank } from '@/types/Bank.ts';
  import type { ResponseData } from '@/types/User.ts';

  const bankStore = useBanksStore();
  const toast = useToast();
  const expandedRows = ref([]);
  const bankTemp = ref<Bank>();

  //filter
  const filters = ref();
  const initFilters = () => {
    filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: { value: null, matchMode: FilterMatchMode.CONTAINS },
      'address.street': { value: null, matchMode: FilterMatchMode.CONTAINS },
      'address.city': { value: null, matchMode: FilterMatchMode.CONTAINS },
    };
  };
  initFilters();
  const clearFilter = () => {
    initFilters();
  };

  //
  //-------------------------------------------------DELETE BANK-------------------------------------------------
  //
  const showDeleteConfirmationDialog = ref<boolean>(false);

  const confirmDeleteBank = async (bank: Bank) => {
    bankTemp.value = bank;
    showDeleteConfirmationDialog.value = true;
  };

  const deleteConfirmationMessage = computed(() => {
    if (bankTemp.value) {
      return `Czy chcesz usunąc bank: <b>${bankTemp.value.name}</b>?`;
    }
    return 'No message';
  });
  const submitDelete = async () => {
    console.log('submitDelete()');
    if (bankTemp.value) {
      await bankStore
        .deleteBankDb(bankTemp.value.id)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Usunięto bank: ' + bankTemp.value?.name,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          if (reason.response && reason.response.status === 423) {
            const data = reason.response?.data as ResponseData;
            toast.add({
              severity: 'warn',
              summary: 'Informacja',
              detail: data?.message,
              life: 5000,
            });
          } else {
            toast.add({
              severity: 'error',
              summary: reason?.message,
              detail: 'Błąd podczas usuwania banku: ' + bankTemp.value?.name,
              life: 5000,
            });
          }
        });
      showDeleteConfirmationDialog.value = false;
    }
  };
  //
  //-------------------------------------------------EDIT BANK-------------------------------------------------
  //
  const editBank = (bank: Bank) => {
    const bankTemp: Bank = JSON.parse(JSON.stringify(bank));
    router.push({
      name: 'Bank',
      params: { isEdit: 'true', bankId: bankTemp.id },
    });
  };

  //
  //-----------------------------------------------------MOUNTED---------------------------------
  onMounted(() => {
    if (bankStore.banks.length <= 1) bankStore.getBanksFromDb();
  });
</script>
<template>
  <TheMenuFinance />
  <ConfirmationDialog
    v-model:visible="showDeleteConfirmationDialog"
    :msg="deleteConfirmationMessage"
    label="Usuń"
    @save="submitDelete"
    @cancel="showDeleteConfirmationDialog = false"
  />

  <Panel class="my-3 mx-2">
    <DataTable
      v-model:filters="filters"
      v-model:expanded-rows="expandedRows"
      :value="bankStore.banks"
      striped-rows
      removable-sort
      paginator
      :rows="10"
      :rows-per-page-options="[5, 10, 20, 50]"
      size="small"
      table-style="min-width: 50rem"
      filter-display="menu"
      :global-filter-fields="['name', 'address.street', 'address.city']"
    >
      <template #header>
        <div class="flex justify-between">
          <router-link
            :to="{
              name: 'Bank',
              params: { isEdit: 'false', bankId: 0 },
            }"
            style="text-decoration: none"
          >
            <Button outlined label="Dodaj" icon="pi pi-plus" title="Dodaj nowy bank" />
          </router-link>
          <div v-if="bankStore.loadingBanks">
            <ProgressSpinner class="ml-3" style="width: 35px; height: 35px" stroke-width="5" />
          </div>
          <div class="flex gap-4">
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText class="!max-w-32" v-model="filters['global'].value" placeholder="wyszukaj..." />
            </IconField>
            <Button
              type="button"
              icon="pi pi-filter-slash"
              outlined
              size="small"
              title="Wyczyść filtry"
              @click="clearFilter()"
            />
          </div>
        </div>
      </template>

      <template #empty>
        <p v-if="!bankStore.loadingBanks" class="text-red-500">Nie znaleziono banków...</p>
      </template>

      <Column expander style="width: 5rem" />

      <!--   NAME   -->
      <Column field="name" header="Nazwa" :sortable="true" style="text-align: left">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..." />
        </template>
      </Column>

      <!--  ADDRESS    -->
      <Column field="address.street" header="Ulica" sortable>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..." />
        </template>
      </Column>
      <Column field="address.city" header="Miasto" sortable>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..." />
        </template>
      </Column>

      <!--                EDIT, DELETE-->
      <Column header="Akcja" :exportable="false" style="max-width: 3rem">
        <template #body="slotProps">
          <div class="flex flex-row gap-1 justify-content-end">
            <OfficeIconButton title="Edytuj bank" icon="pi pi-file-edit" @click="editBank(slotProps.data)" />
            <OfficeIconButton
              title="Usuń bank"
              icon="pi pi-trash"
              severity="danger"
              @click="confirmDeleteBank(slotProps.data)"
            />
          </div>
        </template>
      </Column>
      <template #expansion="slotProps">
        <div class="p-3">
          <p class="text-lg text-center">Szczególy banku</p>

          <p class="mt-2 ml-8" style="text-align: left">
            <b>Adres:</b> ul. {{ slotProps.data.address.street }}, {{ slotProps.data.address.zip }}
            {{ slotProps.data.address.city }}
          </p>
          <p class="mt-2 ml-8" style="text-align: left"><b>E-mail:</b> {{ slotProps.data.mail }}</p>
          <p class="mt-2 ml-8" style="text-align: left"><b>WWW:</b> {{ slotProps.data.www }}</p>
          <p class="mt-2 ml-8" style="text-align: left"><b>Telefon:</b> {{ slotProps.data.phone }}</p>
          <p class="mt-2 ml-8" style="text-align: left"><b>Info:</b> {{ slotProps.data.otherInfo }}</p>
        </div>
      </template>
    </DataTable>
  </Panel>
</template>

<style scoped>
  .p-datatable .p-datatable-tbody > tr > td {
    text-align: center !important;
  }

  :deep(.p-panel-header) {
    padding: 0.25rem !important;
  }
</style>
