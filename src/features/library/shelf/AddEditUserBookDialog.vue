<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import OfficeButton from '@/components/OfficeButton.vue';
  import AddDialog from '@/components/AddDialog.vue';
  import UserBookFormFields from '@/features/library/shelf/UserBookFormFields.vue';
  import { TranslationService } from '@/service/TranslationService.ts';
  import { findBookstore, useBookstoresQuery } from '@/features/library/bookstores/queries/useBookstoresQueries';
  import { useCreateBookstoreMutation } from '@/features/library/bookstores/queries/useBookstoresMutations';
  import { useUserbookQuery } from '@/features/library/shelf/queries/useUserbooksQueries';
  import { useAudiobookAvailabilityQuery, useBookQuery } from '@/features/library/catalog/queries/useBooksQueries';
  import {
    type Bookstore,
    EditionType,
    OwnershipStatus,
    ReadingStatus,
    type UserBook,
  } from '@/features/library/shelf/types';
  import { UtilsService } from '@/service/UtilsService.ts';
  import { cloneBook, cloneUserBook } from '@/features/library/_shared/cloneEntities';
  import { useToast } from 'primevue/usetoast';
  import type { AxiosError } from 'axios';

  UtilsService.getTypesForLibrary();

  const toast = useToast();
  const visible = defineModel<boolean>('visible', { default: false });

  const emit = defineEmits<{
    (e: 'save', userbook: UserBook): void;
    (e: 'cancel'): void;
  }>();
  const props = defineProps({
    idBook: {
      type: Number,
      require: true,
      default: 0,
    },
    isEdit: {
      type: Boolean,
      require: false,
      default: false,
    },
  });

  const editionPillOptions = [
    {
      value: EditionType.BOOK,
      label: TranslationService.translateEnum('EditionType', 'BOOK'),
      icon: 'pi pi-book',
    },
    {
      value: EditionType.AUDIOBOOK,
      label: TranslationService.translateEnum('EditionType', 'AUDIOBOOK'),
      icon: 'pi pi-headphones',
    },
    {
      value: EditionType.EBOOK,
      label: TranslationService.translateEnum('EditionType', 'EBOOK'),
      icon: 'pi pi-tablet',
    },
  ];

  const ownershipPillOptions = [
    {
      value: OwnershipStatus.HAVE,
      label: TranslationService.translateEnum('OwnershipStatus', 'HAVE'),
      icon: 'pi pi-box',
    },
    {
      value: OwnershipStatus.WANT,
      label: TranslationService.translateEnum('OwnershipStatus', 'WANT'),
      icon: 'pi pi-shopping-cart',
    },
    {
      value: OwnershipStatus.READ_ONLY,
      label: TranslationService.translateEnum('OwnershipStatus', 'READ_ONLY'),
      icon: 'pi pi-eye',
    },
  ];
  const submitted = ref<boolean>(false);
  const selectedBookstore = ref<Bookstore | null>();
  const showAddBookstoreModal = ref<boolean>(false);
  const userbook = ref<UserBook>({
    id: 0,
    idUser: 0,
    book: null,
    idBookstore: 0,
    editionType: EditionType.AUDIOBOOK,
    readingStatus: ReadingStatus.NOT_READ,
    ownershipStatus: OwnershipStatus.READ_ONLY,
    readFrom: null,
    readTo: null,
    info: '',
  });

  const { data: bookstoresData, isLoading: loadingBookstore } = useBookstoresQuery();
  const createBookstoreMutation = useCreateBookstoreMutation();

  const isEditEnabled = computed(() => props.isEdit && props.idBook > 0);
  const { data: userbookData, refetch: refetchUserbook } = useUserbookQuery(() => props.idBook, isEditEnabled);

  const isNewBookEnabled = computed(() => !props.isEdit && props.idBook > 0);
  const { data: newBookData } = useBookQuery(() => props.idBook, isNewBookEnabled);

  const audiobookBookId = computed(() => userbook.value.book?.id ?? 0);
  const { data: audiobookAvailabilityData, isLoading: loadingAudiobookAvailability } =
    useAudiobookAvailabilityQuery(audiobookBookId);
  const audiobookAvailability = computed(() => audiobookAvailabilityData.value ?? null);

  function toDateOrNull(value: Date | string | null | undefined): Date | null {
    if (value == null || value === '') return null;
    return UtilsService.formatDate(value) ?? null;
  }

  function applyUserbookFromDb(result: UserBook) {
    const cloned = cloneUserBook(result);
    cloned.readFrom = toDateOrNull(cloned.readFrom);
    cloned.readTo = toDateOrNull(cloned.readTo);
    userbook.value = cloned;
    selectedBookstore.value = findBookstore(bookstoresData.value, userbook.value.idBookstore);
    readingDateFrom.value = cloned.readFrom;
    readingDateTo.value = cloned.readTo;
  }

  // Nowa książka na półkę: dociągnij dane katalogowe wybranej książki
  watch(newBookData, book => {
    if (book) userbook.value.book = cloneBook(book);
  });
  // Edycja: dociągnij dane zapisanej pozycji na półce
  watch(userbookData, result => {
    if (result) applyUserbookFromDb(result);
  });

  // Dociągnięcie/aktualizacja listy księgarni po jej załadowaniu lub zmianie
  watch(bookstoresData, bookstores => {
    if (userbook.value.idBookstore) {
      selectedBookstore.value = findBookstore(bookstores, userbook.value.idBookstore);
    }
  });

  // Watch for dialog visibility to reload data when dialog opens
  watch(visible, (isVisible: boolean | undefined) => {
    if (isVisible && isEditEnabled.value) {
      void refetchUserbook();
    }
  });
  const readingDateFrom = ref<Date | null>(null);
  watch(readingDateFrom, (newDate: Date | null) => {
    console.log('date from ', newDate);
    if (userbook.value) userbook.value.readFrom = newDate;
  });
  const readingDateTo = ref<Date | null>(null);
  watch(readingDateTo, (newDate: Date | null) => {
    if (userbook.value) userbook.value.readTo = newDate;
  });
  const isValid = () => {
    return (
      showErrorBookstore() ||
      showErrorOwnership() ||
      showErrorDateFrom() ||
      showErrorDateTo() ||
      showErrorReadingStatus() ||
      showErrorEditionType()
    );
  };
  const showErrorBookstore = () => {
    return submitted.value && userbook.value.idBookstore === 0;
  };
  const showErrorOwnership = () => {
    return submitted.value && !userbook.value.ownershipStatus;
  };
  const showErrorEditionType = () => {
    return submitted.value && !userbook.value.editionType;
  };
  const showErrorReadingStatus = () => {
    return submitted.value && !userbook.value.readingStatus;
  };
  const showErrorDateFrom = () => {
    return (
      submitted.value &&
      (userbook.value.readingStatus === ReadingStatus.READ_NOW ||
        userbook.value.readingStatus === ReadingStatus.READ) &&
      !userbook.value.readFrom
    );
  };
  const showErrorDateTo = () => {
    return (
      submitted.value &&
      userbook.value.readingStatus === ReadingStatus.READ &&
      (!userbook.value.readFrom || // Sprawdzenie, czy readFrom istnieje
        !userbook.value.readTo || // Sprawdzenie, czy readTo istnieje
        new Date(userbook.value.readTo) <= new Date(userbook.value.readFrom)) // Sprawdzenie kolejności dat
    );
  };

  const getReadToMessage = computed(() => {
    if (!userbook.value.readFrom && userbook.value.readTo) {
      return 'Brak daty rozpoczęcia.';
    }
    if (
      userbook.value.readFrom &&
      userbook.value.readTo &&
      new Date(userbook.value.readTo) <= new Date(userbook.value.readFrom)
    ) {
      return 'Data zakończenia musi być późniejsza niż data rozpoczęcia';
    }
    return 'Pole jest wymagane.';
  });

  const submit = () => {
    submitted.value = true;
    if (!isValid()) {
      emit('save', userbook.value);
      submitted.value = false;
      reset();
    }
  };

  function reset() {
    userbook.value = {
      id: 0,
      idUser: 0,
      book: null,
      idBookstore: 0,
      editionType: EditionType.AUDIOBOOK,
      readingStatus: ReadingStatus.NOT_READ,
      ownershipStatus: OwnershipStatus.READ_ONLY,
      readFrom: null,
      readTo: null,
      info: '',
    };
    selectedBookstore.value = null;
    readingDateFrom.value = null;
    readingDateTo.value = null;
  }

  function onDialogHide() {
    reset();
    submitted.value = false;
    emit('cancel');
  }

  const cancel = () => {
    visible.value = false;
  };

  //--------------------------------------------------BOOKSTORE
  //
  async function saveBookstore(name: string, url: string) {
    if (name.length === 0 || url.length === 0) {
      toast.add({
        severity: 'error',
        summary: 'Error Message',
        detail: 'Uzupełnij brakujące elementy',
        life: 3000,
      });
    } else {
      showAddBookstoreModal.value = false;
      try {
        await createBookstoreMutation.mutateAsync({ id: 0, name, url });
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Dodano księgarnię: ' + name,
          life: 3000,
        });
      } catch (reason) {
        toast.add({
          severity: 'error',
          summary: (reason as AxiosError)?.message,
          detail: 'Nie dodano księgarni: ' + name,
          life: 5000,
        });
      }
    }
  }
</script>

<template>
  <AddDialog
    v-model:visible="showAddBookstoreModal"
    msg="Dodaj księgarnię"
    label1="Nazwa:"
    label2="URL:"
    @save="saveBookstore"
    @cancel="showAddBookstoreModal = false"
  />
  <Dialog v-model:visible="visible" modal :style="{ width: 'min(95vw, 64rem)' }" close-on-escape @hide="onDialogHide">
    <template #header>
      <p class="text-xl font-medium text-surface-900 dark:text-surface-0">
        {{ $props.isEdit ? 'Edytuj książkę na półce' : 'Dodaj nową książkę na półkę' }}
      </p>
    </template>
    <div class="max-h-[70vh] overflow-y-auto pr-1">
      <UserBookFormFields
        v-model:userbook="userbook"
        v-model:selected-bookstore="selectedBookstore"
        v-model:reading-date-from="readingDateFrom"
        v-model:reading-date-to="readingDateTo"
        :bookstores="bookstoresData ?? []"
        :ownership-pill-options="ownershipPillOptions"
        :edition-pill-options="editionPillOptions"
        :show-error-bookstore="showErrorBookstore()"
        :show-error-ownership="showErrorOwnership()"
        :show-error-edition-type="showErrorEditionType()"
        :show-error-reading-status="showErrorReadingStatus()"
        :show-error-date-from="showErrorDateFrom()"
        :show-error-date-to="showErrorDateTo()"
        :read-to-error-message="getReadToMessage"
        :loading-bookstore="loadingBookstore"
        :audiobook-availability="audiobookAvailability"
        :loading-audiobook-availability="loadingAudiobookAvailability"
        @bookstore-change="userbook.idBookstore = selectedBookstore ? selectedBookstore.id : 0"
        @add-bookstore="showAddBookstoreModal = true"
      />
    </div>
    <template #footer>
      <div class="flex flex-row gap-4">
        <OfficeButton text="Anuluj" btn-type="office-regular" @click="cancel" />
        <OfficeButton text="Zapisz" btn-type="office-save" @click="submit" />
      </div>
    </template>
  </Dialog>
</template>
