<script setup lang="ts">
import {useBooksStore} from '@/stores/books.ts'
import {computed, type PropType, ref, watch, watchEffect} from 'vue'
import OfficeButton from '@/components/OfficeButton.vue'
import {useToast} from 'primevue/usetoast'
import type {Author, Book, Category, Series} from '@/types/Book.ts'
import type {AxiosError} from "axios";

const bookStore = useBooksStore()

const toast = useToast()
const selectedAuthors = ref<Author[]>([])
const selectedSeries = ref<Series | null>(null)
const selectedCategories = ref<Category[]>([])

const props = defineProps({
  bookToAdd: {
    type: Object as PropType<Book>,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const book = ref<Book>({
  id: 0,
  series: null,
  authors: [],
  categories: [],
  title: '',
  description: '',
  cover: '',
  bookInSeriesNo: '',
})

watchEffect(async () => {
  book.value = props.bookToAdd
  selectedAuthors.value = props.bookToAdd.authors
  selectedCategories.value = props.bookToAdd.categories
  selectedSeries.value = props.bookToAdd.series
})

const btnShowBusy = ref<boolean>(false)
const btnSaveDisabled = ref<boolean>(false)

const isSaveBtnDisabled = computed(() => {
  return (
      bookStore.loadingBooks ||
      bookStore.loadingSeries ||
      bookStore.loadingAuthors ||
      btnSaveDisabled.value
  )
})
//
//AUTO COMPLETE
//
//AUTHOR
const filteredAuthors = ref<Author[]>()
const searchAuthor = (event: { query: string }) => {
  filteredAuthors.value = bookStore.authors.filter((author: Author) => {
    return author.lastName.toLowerCase().includes(event.query.toLowerCase())
  })
}
watch(selectedAuthors, (newAuthors: Author[] | []) => {
  book.value.authors = newAuthors
})

//SERIES
const filteredSeries = ref<Series[]>()
const searchSeries = (event: { query: string }) => {
  filteredSeries.value = bookStore.series.filter((series: Series) => {
    return series.title.toLowerCase().includes(event.query.toLowerCase())
  })
}
watch(selectedSeries, (newSeries: Series | null) => {
  book.value.series = newSeries
})

//CATEGORY
const filteredCategories = ref<Category[]>()
const searchCategory = (event: { query: string }) => {
  filteredCategories.value = bookStore.categories.filter((cat: Category) => {
    return cat.name.toLowerCase().includes(event.query.toLowerCase())
  })
}
watch(selectedCategories, (newCategory: Category[] | []) => {
  book.value.categories = newCategory
})

//
//SAVE
//
function saveBook() {
  submitted.value = true
  newBook()
}

//
//---------------------------------------------------------NEW BOOK----------------------------------------------
//
async function newBook() {
  console.log('newBook()')
  if (isNotValid()) {
    showError('Uzupełnij brakujące elementy')
  } else {
    btnSaveDisabled.value = true
    btnShowBusy.value = true
    book.value.authors = selectedAuthors.value
    book.value.categories = selectedCategories.value
    book.value.series = selectedSeries.value
    bookStore
        .addBookDb(book.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zapisano książkę: ' + book.value?.title,
            life: 3000,
          })
          btnShowBusy.value = false
          emit('close')
        })
        .catch((reason: AxiosError) => {
          console.log('reason', reason)
          if (reason.response?.status === 409) {
            toast.add({
              severity: 'warn',
              summary: 'Info',
              detail: 'Książka już istnieje w bazie danych.',
              life: 3000,
            })
          } else {
            toast.add({
              severity: 'error',
              summary: 'Błąd',
              detail: 'Błąd podczas dodawania książki.',
              life: 3000,
            })
          }
        })

    btnSaveDisabled.value = false
    btnShowBusy.value = false
    submitted.value = false
  }
}

//
//------------------------------------------------ERROR----------------------------------------------------------
//
const submitted = ref(false)

const showError = (msg: string) => {
  toast.add({
    severity: 'error',
    summary: 'Error Message',
    detail: msg,
    life: 3000,
  })
}
const isNotValid = () => {
  return showErrorTitle() || showErrorAuthor() || showErrorCategory() || showErrorCover()
}
const showErrorTitle = () => {
  return submitted.value && book.value.title.length === 0
}
const showErrorAuthor = () => {
  return submitted.value && book.value.authors.length === 0
}
const showErrorCategory = () => {
  return submitted.value && book.value.categories.length === 0
}
const showErrorCover = () => {
  return submitted.value && book.value.cover.length === 0
}
</script>
<template>
  <Dialog class="" header="Nowa książka" :modal="true" close-on-escape>
    <div class="m-4 max-w-6xl mx-auto">
      <form @submit.stop.prevent="saveBook">
        <!--  --------------------------------------------------------BOOK---------------------------------      -->
        <Fieldset class="w-full" legend="Książka">
          <div class="grid grid-cols-6 gap-4">
            <div class="col-start-1 col-span-4">
              <!-- ROW-1   TITLE -->
              <div class="flex flex-col">
                <label class="ml-2 mb-1" for="title">Tytuł:</label>
                <InputText
                    id="title"
                    v-model="book.title"
                    maxlength="50"
                    :class="{ 'p-invalid': showErrorTitle() }"
                />
                <small class="p-error">{{
                    showErrorTitle() ? 'Pole jest wymagane.' : '&nbsp;'
                  }}</small>
              </div>

              <!-- ROW-2   AUTHOR -->
              <div class="flex gap-2">
                <div class="flex flex-col w-full">
                  <label class="ml-2 mb-1" for="author">Wybierz autora:</label>
                  <AutoComplete
                      id="author"
                      v-model="selectedAuthors"
                      dropdown
                      multiple
                      force-selection
                      :class="{ 'p-invalid': showErrorAuthor() }"
                      :suggestions="filteredAuthors"
                      :option-label="(author) => author.firstName + ' ' + author.lastName"
                      @complete="searchAuthor"
                      :loading="bookStore.loadingAuthors"
                  />
                  <small class="p-error">{{
                      showErrorAuthor() ? 'Pole jest wymagane.' : '&nbsp;'
                    }}</small>
                </div>
              </div>

              <!-- ROW-3  SERIES / NUMBER  -->
              <div class="flex gap-2 mb-5">
                <div class="flex flex-col w-full">
                  <label class="ml-2 mb-1" for="series">Seria:</label>
                  <AutoComplete
                      id="series"
                      v-model="selectedSeries"
                      dropdown
                      force-selection
                      :suggestions="filteredSeries"
                      field="title"
                      option-label="title"
                      @complete="searchSeries"
                      :loading="bookStore.loadingSeries"
                  />
                </div>
                <div class="flex flex-col">
                  <label for="seriesNo">Cześć:</label>
                  <InputText id="seriesNo" v-model="book.bookInSeriesNo" maxlength="5"/>
                </div>
              </div>

              <!-- ROW-4   CATEGORY -->
              <div class="flex gap-2">
                <div class="flex flex-col w-full">
                  <label class="ml-2 mb-1" for="category">Wybierz kategorię:</label>
                  <AutoComplete
                      id="category"
                      v-model="selectedCategories"
                      dropdown
                      multiple
                      force-selection
                      :class="{ 'p-invalid': showErrorCategory() }"
                      :suggestions="filteredCategories"
                      field="name"
                      option-label="name"
                      @complete="searchCategory"
                      :loading="bookStore.loadingCategories"
                  />
                  <small class="p-error">{{
                      showErrorCategory() ? 'Pole jest wymagane.' : '&nbsp;'
                    }}</small>
                </div>
              </div>

              <!-- ROW-5   URL -->
              <div class="flex flex-col">
                <label class="ml-2 mb-1" for="cover">URL okładki:</label>
                <InputText
                    id="cover"
                    v-model="book.cover"
                    :class="{ 'p-invalid': showErrorCover() }"
                />
                <small class="p-error">{{
                    showErrorCover() ? 'Pole jest wymagane.' : '&nbsp;'
                  }}</small>
              </div>
            </div>

            <!-- ROW-   COVER -->
            <div class="col-start-5 col-span-2">
              <img
                  v-if="book.cover.length > 0"
                  :src="book.cover"
                  height="500"
                  width="333"
                  alt="Okładka do książki"
              />
              <img
                  v-else
                  src="@/assets/images/no_cover.jpg"
                  height="300"
                  width="300"
                  alt="Okładka do książki"
              />
            </div>
          </div>
        </Fieldset>

        <!-- ROW-7  OTHER INFO  -->
        <Fieldset legend="Dodatkowe informacje">
          <Textarea id="description" v-model="book.description" fluid rows="5" cols="30"/>
        </Fieldset>

        <!-- ROW-8  BTN SAVE -->
        <div class="flex flex-row justify-end gap-2 mt-6">
          <OfficeButton
              text="zapisz"
              btn-type="office-save"
              type="submit"
              :loading="btnShowBusy"
              :btn-disabled="isSaveBtnDisabled"
          />
        </div>
      </form>
    </div>
  </Dialog>
</template>

<style scoped></style>
