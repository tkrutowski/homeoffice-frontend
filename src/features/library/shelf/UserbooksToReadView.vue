<script setup lang="ts">
  import TheMenuLibrary from '@/features/library/_shared/TheMenuLibrary.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import UserBookSmall from '@/features/library/shelf/UserBookSmall.vue';
  import { useToast } from 'primevue/usetoast';
  import { computed, ref } from 'vue';
  import { ReadingStatus, type UserBook } from '@/features/library/shelf/types';
  import AddEditUserBookDialog from '@/features/library/shelf/AddEditUserBookDialog.vue';
  import type { AxiosError } from 'axios';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import { useUserbooksByStatusQuery } from '@/features/library/shelf/queries/useUserbooksQueries';
  import {
    useDeleteUserbookMutation,
    useUpdateUserbookMutation,
  } from '@/features/library/shelf/queries/useUserbooksMutations';

  const toast = useToast();

  const { data: userbooksData, isLoading: loadingUserbooks } = useUserbooksByStatusQuery(ReadingStatus.NOT_READ);
  const userbooks = computed<UserBook[]>(() => userbooksData.value ?? []);

  const updateUserbookMutation = useUpdateUserbookMutation();
  const deleteUserbookMutation = useDeleteUserbookMutation();

  //
  //-------------------------------------------------USERBOOK-------------------------------------------------
  //
  const showUserbookDialog = ref<boolean>(false);
  const tempUserbook = ref<UserBook>();
  const editUserbook = (newUserbook: UserBook) => {
    tempUserbook.value = newUserbook;
    showUserbookDialog.value = true;
  };
  const submitEditUserbook = async (newUserbook: UserBook) => {
    showUserbookDialog.value = false;
    if (newUserbook) {
      try {
        await updateUserbookMutation.mutateAsync(newUserbook);
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Zaaktualizowano książkę na półce: ' + newUserbook.book?.title,
          life: 3000,
        });
      } catch (reason) {
        toast.add({
          severity: 'error',
          summary: (reason as AxiosError)?.message,
          detail: 'Błąd podczas aktualizacji książki na półkę.',
          life: 3000,
        });
      }
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
    showDeleteConfirmationDialog.value = false;
    if (tempUserbook.value) {
      try {
        await deleteUserbookMutation.mutateAsync(tempUserbook.value.id);
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Usunięto z półki książkę: ' + tempUserbook.value?.book?.title,
          life: 3000,
        });
      } catch (reason) {
        toast.add({
          severity: 'error',
          summary: (reason as AxiosError)?.message,
          detail: 'Błąd podczas usuwania książki z półki: ' + tempUserbook.value?.book?.title,
          life: 3000,
        });
      }
    }
  };
</script>

<template>
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

  <MainPageShell>
    <template #top>
      <TheMenuLibrary />
    </template>

    <div>
      <div class="flex mt-5 dark:bg-surface-800 bg-surface-300 h-14 justify-center items-center gap-4">
        <h2 class="text-3xl font-semibold text-primary">Moja półka - książki w poczekalni...</h2>
        <div v-if="loadingUserbooks">
          <ProgressSpinner style="width: 30px; height: 30px" stroke-width="5" />
        </div>
      </div>

      <div class="flex flex-row flex-wrap justify-center">
        <div v-for="ub in userbooks" :key="ub.id">
          <UserBookSmall :userbook="ub" @edit="editUserbook" @delete="confirmDelete" />
        </div>
      </div>
    </div>
  </MainPageShell>
</template>

<style scoped></style>
