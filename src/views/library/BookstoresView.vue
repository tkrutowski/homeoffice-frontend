<script setup lang="ts">
  import TheMenuLibrary from '@/components/library/TheMenuLibrary.vue';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import AddDialog from '@/components/AddDialog.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import { useBookstoreStore } from '@/stores/bookstores';
  import { computed, ref, onMounted } from 'vue';
  import type { Bookstore } from '@/types/Book';
  import { useToast } from 'primevue/usetoast';
  import type { AxiosError } from 'axios';
  import ButtonOutlined from '@/components/ButtonOutlined.vue';
  import { useUserbooksStore } from '@/stores/userbooks.ts';

  const bookstoreStore = useBookstoreStore();
  const toast = useToast();

  // Load bookstores
  bookstoreStore.getBookstoresFromDb();
  const userbookStore = useUserbooksStore();

  const bookstoreTemp = ref<Bookstore>();
  const bookstoreStatistics = ref<Map<string, number>>(new Map());

  const getCounter = (bookstore: Bookstore) => {
    console.log('getCounter()', bookstore.name);
    return bookstoreStatistics.value.get(bookstore.name) || 0;
  };
  //
  //-------------------------------------------------DELETE -------------------------------------------------
  //
  const showDeleteConfirmationDialog = ref<boolean>(false);
  const confirmDelete = (bookstore: Bookstore) => {
    bookstoreTemp.value = bookstore;
    showDeleteConfirmationDialog.value = true;
  };
  const deleteConfirmationMessage = computed(() => {
    if (bookstoreTemp.value) return `Czy chcesz usunąć księgarnię: <b>${bookstoreTemp.value?.name}</b>?`;
    return 'No message';
  });
  const submitDelete = async () => {
    console.log('submitDelete()');
    showDeleteConfirmationDialog.value = false;
    if (bookstoreTemp.value) {
      await bookstoreStore
        .deleteBookstoreDb(bookstoreTemp.value.id)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Usunięto księgarnię: ' + bookstoreTemp.value?.name,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Nie usunięto księgarni: ' + bookstoreTemp.value?.name,
            life: 3000,
          });
        });
    }
  };

  //
  //-------------------------------------------------ADD/EDIT -------------------------------------------------
  //
  const showAddDialog = ref<boolean>(false);
  const isEditMode = ref<boolean>(false);
  const editingBookstore = ref<Bookstore | null>(null);

  const addBookstore = () => {
    isEditMode.value = false;
    editingBookstore.value = null;
    showAddDialog.value = true;
  };

  const editBookstore = (item: Bookstore) => {
    isEditMode.value = true;
    editingBookstore.value = { ...item };
    showAddDialog.value = true;
  };

  const dialogTitle = computed(() => {
    return isEditMode.value ? 'Edytuj księgarnię' : 'Dodaj księgarnię';
  });

  const submitAddEdit = async (name: string, url: string) => {
    console.log('submitAddEdit()', name, url);
    showAddDialog.value = false;

    const bookstoreData: Bookstore = {
      id: isEditMode.value ? editingBookstore.value!.id : 0,
      name,
      url,
    };

    try {
      if (isEditMode.value) {
        await bookstoreStore.updateBookstoreDb(bookstoreData);
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Zaktualizowano księgarnię: ' + name,
          life: 3000,
        });
      } else {
        await bookstoreStore.addBookstoreDb(bookstoreData);
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Dodano księgarnię: ' + name,
          life: 3000,
        });
      }
    } catch (reason: any) {
      toast.add({
        severity: 'error',
        summary: reason?.message || 'Błąd',
        detail: `Nie udało się ${isEditMode.value ? 'zaktualizować' : 'dodać'} księgarni: ` + name,
        life: 3000,
      });
    }
  };

  //------------------------------------MOUNTED------------------------------
  onMounted(async () => {
    console.log('onMounted StatisticsView');
    try {
      bookstoreStatistics.value = await userbookStore.getBookstoreStatisticsFromDb();
    } catch (error) {
      console.error('Błąd podczas pobierania statystyk:', error);
    }
  });
</script>

<template>
  <TheMenuLibrary />
  <AddDialog
    v-model:visible="showAddDialog"
    :msg="dialogTitle"
    label1="Nazwa"
    label2="URL"
    :value1="editingBookstore?.name || ''"
    :value2="editingBookstore?.url || ''"
    @save="submitAddEdit"
    @cancel="showAddDialog = false"
  />
  <ConfirmationDialog
    v-model:visible="showDeleteConfirmationDialog"
    :msg="deleteConfirmationMessage"
    label="Usuń"
    @save="submitDelete"
    @cancel="showDeleteConfirmationDialog = false"
  />

  <Panel class="my-3 mx-2">
    <DataTable :value="bookstoreStore.bookstores" removable-sort table-style="min-width: 50rem" row-hover size="small">
      <template #header>
        <div class="flex justify-between">
          <ButtonOutlined text="Dodaj" icon="pi pi-plus" title="Dodaj nową księgarnię" @click="addBookstore()" />
          <div v-if="bookstoreStore.loadingBookstore">
            <ProgressSpinner class="ml-3" style="width: 35px; height: 35px" stroke-width="5" />
          </div>
        </div>
      </template>

      <template #empty>
        <p v-if="!bookstoreStore.loadingBookstore" class="text-red-500">Nie znaleziono księgarni...</p>
      </template>

      <!--      NAME        -->
      <Column field="name" header="Nazwa" sortable></Column>

      <!--      URL     -->
      <Column field="url" header="URL" sortable>
        <template #body="slotProps">
          <a v-if="slotProps.data.url" :href="slotProps.data.url" target="_blank" class="text-blue-600 hover:underline">
            {{ slotProps.data.url }}
          </a>
          <span v-else>-</span>
        </template>
      </Column>

      <!--  BOOK COUNT  -->
      <Column field="bookCount" header="Ilość książek" sortable style="max-width: 120px">
        <template #body="slotProps">
          {{ getCounter(slotProps.data) }}
        </template>
      </Column>

      <!--                EDIT, DELETE-->
      <Column header="Akcja" :exportable="false" style="max-width: 70px; justify-items: center">
        <template #body="slotProps">
          <div class="flex flex-row justify-between">
            <OfficeIconButton
              class="text-orange-500"
              title="Edytuj księgarnię"
              icon="pi pi-file-edit"
              @click="editBookstore(slotProps.data)"
            />
            <OfficeIconButton
              title="Usuń księgarnię"
              icon="pi pi-trash"
              class="text-red-500"
              @click="confirmDelete(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </Panel>
</template>

<style scoped>
  :deep(.p-panel-header) {
    padding: 0.25rem !important;
  }
</style>
