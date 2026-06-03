<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import OfficeButton from '@/components/OfficeButton.vue';
  import AddDialog from '@/components/AddDialog.vue';
  import UserBookFormFields from '@/components/library/UserBookFormFields.vue';
  import { TranslationService } from '@/service/TranslationService.ts';
  import { useBookstoreStore } from '@/stores/bookstores.ts';
  import { useUserbooksStore } from '@/stores/userbooks.ts';
  import { getAudiobookAvailability } from '@/service/AudiobookAvailabilityService';
  import { useBooksStore } from '@/stores/books';
  import {
    type AudiobookAvailabilityResponse,
    type Bookstore,
    EditionType,
    OwnershipStatus,
    ReadingStatus,
    type UserBook,
  } from '@/types/Book.ts';
  import { UtilsService } from '@/service/UtilsService.ts';
  import { useToast } from 'primevue/usetoast';
  import type { AxiosError } from 'axios';

  UtilsService.getTypesForLibrary();

  const bookstoreStore = useBookstoreStore();
  const userbookStore = useUserbooksStore();
  const bookStore = useBooksStore();
  const toast = useToast();
  // if (userbookStore.userbooks.length === 0) userbookStore.getUserbooksFromDb();
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

  const audiobookAvailability = ref<AudiobookAvailabilityResponse | null>(null);
  const loadingAudiobookAvailability = ref(false);
  let fetchGeneration = 0;

  function clearAudiobookAvailability() {
    fetchGeneration++;
    audiobookAvailability.value = null;
    loadingAudiobookAvailability.value = false;
  }

  async function fetchAudiobookAvailability(bookId: number) {
    const gen = ++fetchGeneration;
    loadingAudiobookAvailability.value = true;
    audiobookAvailability.value = null;
    try {
      const data = await getAudiobookAvailability(bookId);
      if (gen !== fetchGeneration) return;
      audiobookAvailability.value = data;
    } finally {
      if (gen === fetchGeneration) loadingAudiobookAvailability.value = false;
    }
  }

  function loadAudiobookAvailabilityIfPossible() {
    const bookId = userbook.value.book?.id;
    if (bookId && bookId > 0) {
      fetchAudiobookAvailability(bookId);
    }
  }

  function applyUserbookFromDb(result: UserBook) {
    userbook.value = result;
    selectedBookstore.value = bookstoreStore.getBookstore(userbook.value.idBookstore);
    readingDateFrom.value = userbook.value.readFrom;
    readingDateTo.value = userbook.value.readTo;
    loadAudiobookAvailabilityIfPossible();
  }

  watch(
    () => props.idBook,
    async (id: number) => {
      console.log('WATCH idBook');
      if (!props.isEdit && id > 0) {
        console.log('NEW USERBOOK');
        userbook.value.book = await bookStore.getBookFromDb(id);
        loadAudiobookAvailabilityIfPossible();
      }
      if (props.isEdit && id > 0) {
        console.log('EDIT USERBOOK');
        await userbookStore
          .getUserbookFromDb(id)
          .then((result: UserBook | null) => {
            if (result) applyUserbookFromDb(result);
          })
          .catch((reason: AxiosError) => {
            console.log('ERROR: ', reason);
          });
      }
    }
  );

  // Watch for dialog visibility to reload data when dialog opens
  watch(visible, async (isVisible: boolean | undefined) => {
    if (isVisible && props.isEdit && props.idBook > 0) {
      console.log('WATCH visible - loading userbook data');
      await userbookStore
        .getUserbookFromDb(props.idBook)
        .then((result: UserBook | null) => {
          if (result) applyUserbookFromDb(result);
        })
        .catch((reason: AxiosError) => {
          console.log('ERROR: ', reason);
        });
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
    clearAudiobookAvailability();
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
    console.log('in1: ', name);
    console.log('in2: ', url);
    if (name.length === 0 || url.length === 0) {
      toast.add({
        severity: 'error',
        summary: 'Error Message',
        detail: 'Uzupełnij brakujące elementy',
        life: 3000,
      });
    } else {
      showAddBookstoreModal.value = false;
      await bookstoreStore
        .addBookstoreDb({
          id: 0,
          name: name,
          url: url,
        })
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Dodano księgarnię: ' + name,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Nie dodano księgarni: ' + name,
            life: 5000,
          });
        });
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
  <Dialog
    v-model:visible="visible"
    modal
    :style="{ width: 'min(95vw, 64rem)' }"
    close-on-escape
    @hide="onDialogHide"
  >
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
        :bookstores="bookstoreStore.bookstores"
        :ownership-pill-options="ownershipPillOptions"
        :edition-pill-options="editionPillOptions"
        :show-error-bookstore="showErrorBookstore()"
        :show-error-ownership="showErrorOwnership()"
        :show-error-edition-type="showErrorEditionType()"
        :show-error-reading-status="showErrorReadingStatus()"
        :show-error-date-from="showErrorDateFrom()"
        :show-error-date-to="showErrorDateTo()"
        :read-to-error-message="getReadToMessage"
        :loading-bookstore="bookstoreStore.loadingBookstore"
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
