<script setup lang="ts">
  import TheMenuLibrary from '@/features/library/_shared/TheMenuLibrary.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import UserBookSmall from '@/features/library/shelf/UserBookSmall.vue';
  import { computed, ref, watch } from 'vue';
  import type { UserBook } from '@/features/library/shelf/types';
  import { ReadingStatus } from '@/features/library/shelf/types';
  import AddEditUserBookDialog from '@/features/library/shelf/AddEditUserBookDialog.vue';
  import { useToast } from 'primevue/usetoast';
  import type { AxiosError } from 'axios';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import {
    useUserbooksByStatusAndYearQuery,
    useUserbooksSearchQuery,
  } from '@/features/library/shelf/queries/useUserbooksQueries';
  import {
    useDeleteUserbookMutation,
    useUpdateUserbookMutation,
  } from '@/features/library/shelf/queries/useUserbooksMutations';

  const toast = useToast();
  const selectedYear = ref<number>(new Date().getFullYear());
  const displayedYear = ref<number>(new Date().getFullYear());
  const appliedYear = ref<number>(new Date().getFullYear());
  const searchQuery = ref<string>('');
  const debouncedQuery = ref<string>('');
  const searchTimeout = ref<NodeJS.Timeout | null>(null);
  const displayText = ref<string>(selectedYear.value.toString());

  const isSearchActive = computed(() => debouncedQuery.value.trim().length >= 3);

  const {
    data: yearUserbooksData,
    isFetching: yearUserbooksFetching,
    refetch: refetchYearUserbooks,
  } = useUserbooksByStatusAndYearQuery(ReadingStatus.READ, appliedYear);
  const { data: searchUserbooksData, isFetching: searchUserbooksFetching } = useUserbooksSearchQuery(
    debouncedQuery,
    isSearchActive
  );

  const userbooks = computed<UserBook[]>(() =>
    isSearchActive.value ? (searchUserbooksData.value ?? []) : (yearUserbooksData.value ?? [])
  );
  const loadingUserbooks = computed(() =>
    isSearchActive.value ? searchUserbooksFetching.value : yearUserbooksFetching.value
  );

  const updateUserbookMutation = useUpdateUserbookMutation();
  const deleteUserbookMutation = useDeleteUserbookMutation();

  // Watch dla automatycznego wyszukiwania z debounce
  watch(searchQuery, newQuery => {
    // cancel previous timeout
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value);
    }

    // new timeout
    if (newQuery.length >= 3) {
      displayText.value = 'Wyszukiwanie';
      searchTimeout.value = setTimeout(() => {
        debouncedQuery.value = newQuery;
      }, 500); // 500ms debounce
    } else if (newQuery.length === 0) {
      displayText.value = selectedYear.value.toString();
      debouncedQuery.value = '';
    }
  });

  function getUserbooks() {
    searchQuery.value = '';
    debouncedQuery.value = '';
    displayedYear.value = selectedYear.value;
    if (appliedYear.value === selectedYear.value) {
      void refetchYearUserbooks();
    } else {
      appliedYear.value = selectedYear.value;
    }
  }

  function clearSearch() {
    searchQuery.value = '';
    getUserbooks();
  }

  function getTotalAudiobook(edition: string): number {
    return userbooks.value.filter((ub: UserBook) => ub.editionType === edition).length;
  }

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
      <Toolbar class="m-6 text-color">
        <template #start
          ><p class="mt-auto mb-auto">ROK: {{ displayText }}</p></template
        >
        <template #center>
          <InputNumber
            v-model="selectedYear"
            :min="2010"
            :max="2040"
            show-buttons
            :format="false"
            button-layout="horizontal"
          />
          <Button
            class="font-bold uppercase tracking-wider h-full ml-2"
            outlined
            icon="pi pi-search"
            :disabled="loadingUserbooks"
            :loading="loadingUserbooks"
            @click="getUserbooks"
          />
        </template>

        <template #end>
          <div class="flex gap-4">
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText class="!max-w-32" v-model="searchQuery" placeholder="wyszukaj..." />
            </IconField>
            <Button type="button" icon="pi pi-times" outlined title="Wyczyść wyszukiwanie" @click="clearSearch" />
          </div>
        </template>
      </Toolbar>

      <div class="flex flex-row flex-wrap justify-center">
        <div v-for="ub in userbooks" :key="ub.id">
          <UserBookSmall :userbook="ub" @edit="editUserbook" @delete="confirmDelete" />
        </div>
      </div>
    </div>
    <Toolbar class="sticky-toolbar m-6">
      <template #start>
        <div class="flex flex-row text-color gap-3">
          <p class="mb-1">
            <small>Audiobook:</small>
            {{ getTotalAudiobook('AUDIOBOOK') }}
          </p>
          <p class="mb-1">
            <small>Ebooki:</small>
            {{ getTotalAudiobook('EBOOK') }}
          </p>
          <p class="mb-1">
            <small>Papierowe:</small>
            {{ getTotalAudiobook('BOOK') }}
          </p>
        </div>
      </template>

      <template #end>
        <p class="mb-1 text-color">
          RAZEM:
          {{ getTotalAudiobook('AUDIOBOOK') + getTotalAudiobook('EBOOK') + getTotalAudiobook('BOOK') }}
        </p>
      </template>
    </Toolbar>
  </MainPageShell>
</template>

<style scoped></style>
