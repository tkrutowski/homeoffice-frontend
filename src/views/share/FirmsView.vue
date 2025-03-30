<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {FilterMatchMode} from '@primevue/core/api';
import OfficeButton from "@/components/OfficeButton.vue";
import router from "@/router";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import type {Firm} from "@/types/Firm.ts";
import {useToast} from "primevue/usetoast";
import OfficeIconButton from "@/components/OfficeIconButton.vue";
import type {AxiosError} from "axios";
import {useFirmsStore} from "@/stores/firms.ts";
import TheMenuFinance from "@/components/finance/TheMenuFinance.vue";

const firmStore = useFirmsStore();
const toast = useToast();
const expandedRows = ref([]);
const firmTemp = ref<Firm>();

//filter
const filters = ref();
const initFilters = () => {
  filters.value = {
    global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    name: {value: null, matchMode: FilterMatchMode.CONTAINS},
    'address.street': {value: null, matchMode: FilterMatchMode.CONTAINS},
    'address.city': {value: null, matchMode: FilterMatchMode.CONTAINS},
  };
}
initFilters();
const clearFilter = () => {
  initFilters();
};

//
//-------------------------------------------------DELETE FIRM-------------------------------------------------
//
const showDeleteConfirmationDialog = ref<boolean>(false);

const confirmDeleteFirm = async (firm: Firm) => {
  firmTemp.value = firm;
  showDeleteConfirmationDialog.value = true;
};

const deleteConfirmationMessage = computed(() => {
  if (firmTemp.value) {
    return `Czy chcesz usunąc firmę: <b>${firmTemp.value.name}</b>?`;
  }
  return "No message";
});
const submitDelete = async () => {
  console.log("submitDelete()");
  if (firmTemp.value) {
    await firmStore.deleteFirmDb(firmTemp.value.id)
        .then(() => {
          toast.add({
            severity: "success",
            summary: "Potwierdzenie",
            detail: "Usunięto firmę: " + firmTemp.value?.name,
            life: 3000,
          });
        }).catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas usuwania firmy: ' + firmTemp.value?.name,
            life: 5000,
          })
        })
  }
  showDeleteConfirmationDialog.value = false;
};

//
//-------------------------------------------------EDIT FIRM-------------------------------------------------
//
const editFirm = (firm: Firm) => {
  const firmTemp: Firm = JSON.parse(JSON.stringify(firm));
  router.push({
    name: "Firm",
    params: {isEdit: "true", firmId: firmTemp.id},
  });
};

//
//-----------------------------------------------------MOUNTED---------------------------------
onMounted(() => {
  if (firmStore.firms.length <= 1)firmStore.getFirmsFromDb();
});

</script>
<template>
  <TheMenuFinance/>
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
        :value="firmStore.firms"
        :loading="firmStore.loadingFirms"
        striped-rows
        removable-sort
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50]"
        size="small"
        table-style="min-width: 50rem"
        filter-display="menu"
        :global-filter-fields="[
        'name',
        'address.street',
        'address.city',
      ]"
    >
      <template #header>
        <div class="flex justify-between">
          <router-link
              :to="{
              name: 'Firm',
              params: { isEdit: 'false', firmId: 0 },
            }"
              style="text-decoration: none"
          >
            <Button outlined label="Dodaj" icon="pi pi-plus" title="Dodaj nową firmę"/>
          </router-link>
          <div v-if="firmStore.loadingFirms">
            <ProgressSpinner
                class="ml-3"
                style="width: 35px; height: 35px"
                stroke-width="5"
            />
          </div>
          <div class="flex gap-4">
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search"/>
              </InputIcon>
              <InputText class="!max-w-32"
                         v-model="filters['global'].value"
                         placeholder="wyszukaj..."
              />
            </IconField>
            <Button
                type="button"
                icon="pi pi-filter-slash"
                outlined size="small"
                title="Wyczyść filtry"
                @click="clearFilter()"
            />
          </div>
        </div>
      </template>

      <template #empty>
        <p v-if="!firmStore.loadingFirms" class="text-red-500">
          Nie znaleziono firm...
        </p>
      </template>

      <Column expander style="width: 5rem"/>

      <!--   NAME   -->
      <Column
          field="name"
          header="Nazwa"
          :sortable="true"
          style="text-align: left"
      >
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..."/>
        </template>
      </Column>

      <!--  ADDRESS    -->
      <Column field="address.street" header="Ulica" sortable>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..."/>
        </template>
      </Column>
      <Column field="address.city" header="Miasto" sortable>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..."/>
        </template>
      </Column>

      <!--                EDIT, DELETE-->
      <Column header="Akcja" :exportable="false" style="max-width: 3rem">
        <template #body="slotProps">
          <div class="flex flex-row gap-1 justify-content-end">
            <OfficeIconButton
                title="Edytuj firmę"
                icon="pi pi-file-edit"
                @click="editFirm(slotProps.data)"
            />
            <OfficeIconButton
                title="Usuń firmę"
                icon="pi pi-trash"
                severity="danger"
                @click="confirmDeleteFirm(slotProps.data)"
            />
          </div>
        </template>
      </Column>
      <template #expansion="slotProps">
        <div class="p-3">
          <p class="text-lg text-center">Szczególy firmy</p>

          <p class="mt-2 ml-8" style="text-align: left">
            <b>Adres:</b> ul. {{ slotProps.data.address.street }},
            {{ slotProps.data.address.zip }} {{ slotProps.data.address.city }}
          </p>
          <p class="mt-2 ml-8" style="text-align: left">
            <b>E-mail:</b> {{ slotProps.data.mail }}
          </p>
          <p class="mt-2 ml-8" style="text-align: left">
            <b>WWW:</b> {{ slotProps.data.www }}
          </p>
          <p class="mt-2 ml-8" style="text-align: left">
            <b>Telefon:</b> {{ slotProps.data.phone }}
          </p>
          <p class="mt-2 ml-8" style="text-align: left">
            <b>Info:</b> {{ slotProps.data.otherInfo }}
          </p>
        </div>
      </template>
    </DataTable>
  </Panel>
</template>

<style scoped>
.p-datatable .p-datatable-tbody > tr > td {
  text-align: center !important;
}
::v-deep(.p-panel-header) {
  padding: 0.25rem !important;
}
</style>
