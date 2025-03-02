<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import OfficeButton from '@/components/OfficeButton.vue'
import {useBookstoreStore} from '@/stores/bookstores.ts'
import {useUserbooksStore} from '@/stores/userbooks.ts'
import {useBooksStore} from '@/stores/books.ts'
import {type Bookstore, EditionType, OwnershipStatus, ReadingStatus, type UserBook} from '@/types/Book.ts'
import {UtilsService} from '@/service/UtilsService.ts'
import type {AxiosError} from "axios";

UtilsService.getTypesForLibrary()

const bookstoreStore = useBookstoreStore()
const userbookStore = useUserbooksStore()
const bookStore = useBooksStore()
// if (userbookStore.userbooks.length === 0) userbookStore.getUserbooksFromDb();
const emit = defineEmits<{
  (e: 'save', userbook: UserBook): void
  (e: 'cancel'): void
}>()
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
})
const submitted = ref<boolean>(false)
const selectedBookstore = ref<Bookstore | null>()
const userbook = ref<UserBook>({
  id: 0,
  idUser: 0,
  book: null,
  idBookstore: 0,
  editionType: EditionType.BOOK,
  readingStatus: ReadingStatus.NOT_READ,
  ownershipStatus: OwnershipStatus.READ_ONLY,
  readFrom: null,
  readTo: null,
  info: '',
})

watch(
    () => props.idBook,
    async (id: number) => {
      console.log('WATCH')
      if (!props.isEdit && id > 0) {
        console.log('NEW USERBOOK')
        userbook.value.book = await bookStore.getBookFromDb(id)
      }
      if (props.isEdit && id > 0) {
        console.log('EDIT USERBOOK')
        await userbookStore.getUserbookFromDb(id).then((result: UserBook | null) => {
          if (result) {
            userbook.value = result
            selectedBookstore.value = bookstoreStore.getBookstore(userbook.value.idBookstore)
            readingDateFrom.value = userbook.value.readFrom
            readingDateTo.value = userbook.value.readTo
          }
        }).catch((reason: AxiosError) => {
          console.log('ERROR: ', reason)
        })
      }
    },
)
const readingDateFrom = ref<Date | null>(null)
watch(readingDateFrom, (newDate: Date | null) => {
  console.log('date from ', newDate)
  if (userbook.value) userbook.value.readFrom = newDate
})
const readingDateTo = ref<Date | null>(null)
watch(readingDateTo, (newDate: Date | null) => {
  if (userbook.value) userbook.value.readTo = newDate
})
const isValid = () => {
  return (
      showErrorBookstore() ||
      showErrorOwnership() ||
      showErrorDateFrom() ||
      showErrorDateTo() ||
      showErrorReadingStatus() ||
      showErrorEditionType()
  )
}
const showErrorBookstore = () => {
  return submitted.value && userbook.value.idBookstore === 0
}
const showErrorOwnership = () => {
  return submitted.value && userbook.value.ownershipStatus.length === 0
}
const showErrorEditionType = () => {
  return submitted.value && userbook.value.editionType.length === 0
}
const showErrorReadingStatus = () => {
  return submitted.value && userbook.value.readingStatus.length === 0
}
const showErrorDateFrom = () => {
  return (
      submitted.value &&
      (userbook.value.readingStatus === ReadingStatus.READ_NOW ||
          userbook.value.readingStatus === ReadingStatus.READ) &&
      !userbook.value.readFrom
  )
}
const showErrorDateTo = () => {
  return (
      submitted.value &&
      userbook.value.readingStatus === ReadingStatus.READ &&
      (!userbook.value.readFrom || // Sprawdzenie, czy readFrom istnieje
          !userbook.value.readTo ||  // Sprawdzenie, czy readTo istnieje
          new Date(userbook.value.readTo) <= new Date(userbook.value.readFrom)) // Sprawdzenie kolejności dat
  );
}

const getReadToMessage = computed(() =>{
  if(!userbook.value.readFrom && userbook.value.readTo){
      return "Brak daty rozpoczęcia."
  }
  if((userbook.value.readFrom && userbook.value.readTo) && (new Date(userbook.value.readTo) <= new Date(userbook.value.readFrom))){
      return "Data zakończenia musi być późniejsza niż data rozpoczęcia"
  }
  return "Pole jest wymagane."
})

const submit = () => {
  submitted.value = true
  if (!isValid()) {
    emit('save', userbook.value)
    submitted.value = false
    reset()
  }
}

function reset() {
  userbook.value = {
    id: 0,
    idUser: 0,
    book: null,
    idBookstore: 0,
    editionType: EditionType.BOOK,
    readingStatus: ReadingStatus.NOT_READ,
    ownershipStatus: OwnershipStatus.READ_ONLY,
    readFrom: null,
    readTo: null,
    info: '',
  }
  selectedBookstore.value = null
  readingDateFrom.value = null
  readingDateTo.value = null
}

const cancel = () => {
  reset()
  emit('cancel')
}
</script>

<template>
  <Dialog modal class="max-w-5xl mx-auto" close-on-escape @abort="cancel">
    <template #header>
      <p class="text-2xl mx-auto">
        {{ $props.isEdit ? 'Edytuj książkę na półce' : 'Dodaj nową książkę na półkę' }}
      </p>
    </template>
    <Fieldset class="w-full" legend="Książka">
      <div class="grid grid-cols-6 gap-4">
        <div class="col-start-1 col-span-4">
          <!-- ROW-1   BOOKSTORE -->
          <div class="flex flex-row">
            <div class="flex flex-col w-full">
              <label class="ml-2 mb-1" for="input-bookstore">Wybierz księgarnię:</label>
              <Select
                  id="input-bookstore"
                  v-model="selectedBookstore"
                  :class="{ 'p-invalid': showErrorBookstore() }"
                  :options="bookstoreStore.bookstores"
                  option-label="name"
                  @change="userbook.idBookstore = selectedBookstore ? selectedBookstore.id : 0"
                  :loading="bookstoreStore.loadingBookstore"
              />
              <small class="p-error">{{
                  showErrorBookstore() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
          </div>

          <!-- ROW-2 OWNERSHIP -->
          <div class="flex flex-row">
            <div class="flex flex-col w-full">
              <label class="ml-2 mb-1" for="input-ownership">Wybierz własność:</label>
              <Select
                  id="input-ownership"
                  v-model="userbook.ownershipStatus"
                  :class="{ 'p-invalid': showErrorOwnership() }"
                  :options="userbookStore.ownershipStatus"
                  option-label="viewName"
                  :loading="userbookStore.loadingOwnership"
              />
              <small class="p-error">{{
                  showErrorOwnership() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
          </div>

          <!-- ROW-3 EDITION -->
          <div class="flex flex-row">
            <div class="flex flex-col w-full">
              <label class="ml-2 mb-1" for="input-edition">Wybierz rodzaj:</label>
              <Select
                  id="input-edition"
                  v-model="userbook.editionType"
                  :class="{ 'p-invalid': showErrorEditionType() }"
                  :options="userbookStore.editionTypes"
                  option-label="viewName"
                  :loading="userbookStore.loadingEditionType"
              />
              <small class="p-error">{{
                  showErrorEditionType() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
          </div>

          <!-- ROW-4 READ STATUS -->
          <div class="flex flex-row">
            <div class="flex flex-col w-full">
              <label class="ml-2 mb-1" for="input-read">Stan czytania:</label>
              <Select
                  id="input-read"
                  v-model="userbook.readingStatus"
                  :class="{ 'p-invalid': showErrorReadingStatus() }"
                  :options="userbookStore.readingStatuses"
                  option-label="viewName"
                  :loading="userbookStore.loadingReadingStatus"
              />
              <small class="p-error">{{
                  showErrorReadingStatus() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
          </div>

          <!-- ROW-5  DATE FROM DATE TO  -->
          <div class="flex-row flex gap-4">
            <div class="flex-row flex w-full">
              <div class="flex flex-col w-full">
                <label class="ml-2 mb-1" for="date-from">Czytana od:</label>
                <DatePicker
                    id="date-from"
                    v-model="readingDateFrom"
                    show-icon showButtonBar
                    date-format="yy-mm-dd"
                    :invalid="showErrorDateFrom()"
                />
                <small class="p-error">{{
                    showErrorDateFrom() ? 'Pole jest wymagane.' : '&nbsp;'
                  }}</small>
              </div>
            </div>

            <div class="flex-row flex w-full">
              <div class="flex flex-col w-full">
                <label class="ml-2 mb-1" for="date-to">Czytana do:</label>
                <DatePicker
                    id="date-to"
                    v-model="readingDateTo"
                    show-icon showButtonBar
                    date-format="yy-mm-dd"
                    :invalid="showErrorDateTo()"
                />
                <small class="p-error">{{
                    showErrorDateTo() ? getReadToMessage : '&nbsp;'
                  }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- ROW-   COVER -->
        <div class="col-start-5 col-span-2">
          <img
              v-if="userbook.book && userbook.book.cover.length > 0"
              :src="userbook.book?.cover"
              height="500"
              width="333"
              alt="Okładka do książki"
          />
          <img v-else src="@/assets/images/no_cover.jpg" alt="Okładka do książki"/>
        </div>
      </div>
    </Fieldset>

    <!-- ROW-7  OTHER INFO  -->
    <Fieldset legend="Dodatkowe informacje">
      <Textarea v-model="userbook.info" fluid rows="3" cols="30"/>
    </Fieldset>
    <template #footer>
      <div class="flex flex-row gap-4">
        <OfficeButton text="Anuluj" btn-type="office-regular" @click="cancel"/>
        <OfficeButton text="Zapisz" btn-type="office-save" @click="submit"/>
      </div>
    </template>
  </Dialog>
</template>
