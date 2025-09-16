<script setup lang="ts">
  import TheMenuLibrary from '@/components/library/TheMenuLibrary.vue';
  import { useUserbooksStore } from '@/stores/userbooks';
  import UserBookSmall from '@/components/library/UserBookSmall.vue';
  import AddEditUserBookDialog from '@/components/library/AddEditUserBookDialog.vue';
  import { computed, onMounted, ref } from 'vue';
  import type { UserBook } from '@/types/Book';
  import { ReadingStatus } from '@/types/Book';

  import { useToast } from 'primevue/usetoast';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import type { AxiosError } from 'axios';

  const userbookStore = useUserbooksStore();
  const toast = useToast();
  const userbooks = ref<UserBook[]>([]);

  onMounted(async () => {
    userbooks.value = await userbookStore.getUserbooksByStatusFromDb(ReadingStatus.READ_NOW);
  });

  //
  //-------------------------------------------------USERBOOK EDIT-------------------------------------------------
  //
  const showUserbookDialog = ref<boolean>(false);
  const tempUserbook = ref<UserBook | null>(null);
  const editUserbook = (newUserbook: UserBook) => {
    tempUserbook.value = newUserbook;
    showUserbookDialog.value = true;
  };
  const submitEditUserbook = async (newUserbook: UserBook) => {
    showUserbookDialog.value = false;
    if (newUserbook) {
      await userbookStore
        .updateUserbookDb(newUserbook)
        .then(() => {
          // If status has changed from READ_NOW to another value, remove the book from the list
          if (newUserbook.readingStatus !== ReadingStatus.READ_NOW) {
            const index = userbooks.value.findIndex(ub => ub.id === newUserbook.id);
            if (index !== -1) {
              userbooks.value.splice(index, 1);
            }
          } else {
            // If status remains READ_NOW, update the book in the list
            const index = userbooks.value.findIndex(ub => ub.id === newUserbook.id);
            if (index !== -1) {
              userbooks.value[index] = newUserbook;
            }
          }
          
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano książkę na półce: ' + newUserbook.book?.title,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas aktualizacji książki.',
            life: 3000,
          });
        });
    }
  };
  //
  //-------------------------------------------------USERBOOK DELETE -------------------------------------------------
  //
  const showDeleteConfirmationDialog = ref<boolean>(false);
  const confirmDelete = (userbook: UserBook) => {
    tempUserbook.value = userbook;
    showDeleteConfirmationDialog.value = true;
  };
  const deleteConfirmationMessage = computed(() => {
    if (tempUserbook.value) return `Czy chcesz usunąc z półki książkę: <b>${tempUserbook.value?.book?.title}</b>?`;
    return 'No message';
  });
  const submitDelete = async () => {
    console.log('submitDelete()');
    showDeleteConfirmationDialog.value = false;
    if (tempUserbook.value) {
      await userbookStore
        .deleteUserbookDb(tempUserbook.value.id)
        .then(() => {
          const index = userbooks.value.findIndex(ub => ub.id === tempUserbook.value?.id);
          if (index !== -1) {
            userbooks.value.splice(index, 1);
          }
          
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Usunięto z półki książkę: ' + tempUserbook.value?.book?.title,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas usuwania książki z półki: ' + tempUserbook.value?.book?.title,
            life: 3000,
          });
        });
    }
  };
</script>

<template>
  <TheMenuLibrary />
  <AddEditUserBookDialog
    v-model:visible="showUserbookDialog"
    :id-book="tempUserbook?.id"
    :is-edit="true"
    @save="submitEditUserbook"
    @cancel="showUserbookDialog = false"
  />
  <ConfirmationDialog
    v-model:visible="showDeleteConfirmationDialog"
    :msg="deleteConfirmationMessage"
    label="Usuń"
    @save="submitDelete"
    @cancel="showDeleteConfirmationDialog = false"
  />
  <div>
    <div class="flex mt-5 dark:bg-surface-800 bg-surface-300 h-14 justify-center items-center gap-4">
      <p class="text-3xl font-semibold text-primary">Moja półka - aktualnie czytane...</p>
      <div v-if="userbookStore.loadingUserbooks">
        <ProgressSpinner style="width: 30px; height: 30px" stroke-width="5" />
      </div>
    </div>

    <div class="flex flex-row flex-wrap justify-center">
      <div v-for="ub in userbooks" :key="ub.id">
        <UserBookSmall :userbook="ub" @edit="editUserbook" @delete="confirmDelete" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
