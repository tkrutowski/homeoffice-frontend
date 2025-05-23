<script setup lang="ts">
import {useBooksStore} from '@/stores/books'
import {useRoute} from 'vue-router'
import {computed, onMounted, ref, watch} from 'vue'
import OfficeButton from '@/components/OfficeButton.vue'
import router from '@/router'
import IconButton from '@/components/OfficeIconButton.vue'
import {useToast} from 'primevue/usetoast'
import type {Author, Book, Category, Series} from '@/types/Book'
import TheMenuLibrary from '@/components/library/TheMenuLibrary.vue'
import AddDialog from '@/components/AddDialog.vue'
import OfficeIconButton from '@/components/OfficeIconButton.vue'
import type {AxiosError} from "axios";

const bookStore = useBooksStore()
const route = useRoute()

const toast = useToast()
const selectedAuthors = ref<Author[]>([])
const selectedSeries = ref<Series | null>(null)
const selectedCategories = ref<Category[]>([])

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
    return author.lastName.toLowerCase().includes(event.query.toLowerCase()) || author.firstName.toLowerCase().includes(event.query.toLowerCase())
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
  if (isEdit.value) {
    editBook()
  } else {
    newBook()
  }
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
          setTimeout(() => {
            resetForm()
          }, 1000)
        })
        .catch((reason: AxiosError) => {
          console.log('reason', reason)
          if (reason.response?.status === 409) {
            toast.add({
              severity: 'warn',
              summary: 'Info',
              detail: 'Książka już istnieje w bazie danych.',
              life: 5000,
            })
          } else {
            toast.add({
              severity: 'error',
              summary: reason?.message,
              detail: 'Błąd podczas dodawania książki.',
              life: 5000,
            })
          }
        })

    btnSaveDisabled.value = false
    btnShowBusy.value = false
    submitted.value = false
  }
}

//
//-----------------------------------------------------EDIT BOOK------------------------------------------------
//
const isEdit = ref<boolean>(false)

async function editBook() {
  if (isNotValid()) {
    showError('Uzupełnij brakujące elementy')
  } else {
    btnSaveDisabled.value = true
    console.log('editBook()')
    book.value.authors = selectedAuthors.value
    book.value.categories = selectedCategories.value
    book.value.series = selectedSeries.value
    await bookStore
        .updateBookDb(book.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano książkę: ' + book.value?.title,
            life: 3000,
          })
          setTimeout(() => {
            router.push({name: 'Books'})
          }, 3000)
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas edycji książki.',
            life: 5000,
          })
          btnSaveDisabled.value = false
        })
  }
}

//---------------------------------------------MOUNTED--------------------------------------------
onMounted(() => {
  console.log('onMounted GET')
  btnSaveDisabled.value = true
  if (bookStore.authors.length === 0) bookStore.getAuthorsFromDb()
  if (bookStore.series.length === 0) bookStore.getSeriesFromDb()
  if (bookStore.categories.length === 0) bookStore.getCategoriesFromDb()
  if(bookStore.books.length === 0) bookStore.getBooksFromDb()
  btnSaveDisabled.value = false
})

onMounted(async () => {
  btnSaveDisabled.value = true
  isEdit.value = route.params.isEdit === 'true'
  const bookId = Number(route.params.bookId as string)
  if (!isEdit.value && bookId === -1) {
    book.value = bookStore.tempBook
    selectedAuthors.value = book.value.authors
    selectedCategories.value = book.value.categories
    selectedSeries.value = book.value.series
  } else if (!isEdit.value && bookId === 0) {
    console.log('onMounted NEW BOOK')
  } else {
    console.log('onMounted EDIT BOOK')
    bookStore
        .getBookFromDb(bookId)
        .then((data: Book | null) => {
          if (data) {
            book.value = data
            selectedAuthors.value = book.value.authors
            selectedCategories.value = book.value.categories
            selectedSeries.value = book.value.series
          }
        })
        .catch((error: AxiosError) => {
          console.error('Błąd podczas pobierania książek:', error)
        })
  }
  btnSaveDisabled.value = false
})
//
//--------------------------------------------------AUTHOR
//
const showAddModal = ref(false)

async function saveAuthor(firstName: string, lastName: string) {
  console.log('in1: ', firstName)
  console.log('in2: ', lastName)
  showAddModal.value = false
  if (firstName.length === 0 || lastName.length === 0) {
    showError('Uzupełnij brakujące elementy')
  } else {
    await bookStore.addAuthorDb({
      id: 0,
      firstName: firstName,
      lastName: lastName,
    }).then(() => {
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Dodano autora: ' + firstName + ' ' + lastName,
        life: 3000,
      })
    }).catch((reason: AxiosError) => {
      toast.add({
        severity: 'error',
        summary: reason?.message,
        detail: 'Nie dodano autora: ' + firstName + ' ' + lastName,
        life: 5000,
      })
    })
  }
}

//
//--------------------------------------------------CATEGORY
//
const showAddCategoryModal = ref(false)

async function saveCategory(name: string) {
  console.log('in1: ', name)
  showAddCategoryModal.value = false
  if (name.length === 0) {
    showError('Uzupełnij brakujące elementy')
  } else {
    await bookStore.addCategoryDb({
      id: 0,
      name: name,
    }).then(() => {
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Dodano kategorię: ' + name,
        life: 3000,
      })
    }).catch((reason: AxiosError) => {
      toast.add({
        severity: 'error',
        summary: reason?.message,
        detail: 'Nie dodano kategorii: ' + name,
        life: 5000,
      })
    })
  }
}

//
//----------------------------------------------SEARCH---------------------------------------------
//
const searchUrl = ref<string>('')
const btnSearchShowError = ref<boolean>(false)
const btnSearchShowBusy = ref<boolean>(false)
const btnSearchShowOk = ref<boolean>(false)
const btnSearchDisabled = ref<boolean>(false)

function findBook() {
  console.log('START - findBook(' + searchUrl.value + ')')
  submittedSearch.value = true
  resetForm()
  if (isSearchNotValid()) {
    showError('Uzupełnij brakujące elementy')
    btnSearchShowError.value = true
    setTimeout(() => (btnSearchShowError.value = false), 5000)
  } else {
    btnSearchDisabled.value = true
    bookStore
        .getBookFromUrl(searchUrl.value)
        .then((bookByUrl: Book | null) => {
          if (bookByUrl == null) {
            btnSearchDisabled.value = false
            changeStatusSearchIcon(false, false, true)
            setTimeout(() => changeStatusSearchIcon(false, false, false), 8000)
            toast.add({
              severity: 'info',
              summary: 'Informacja',
              detail: 'Nie znaleziono książki.',
              life: 3500,
            })
          } else {
            btnSearchDisabled.value = false
            changeStatusSearchIcon(false, true, false)
            setTimeout(() => changeStatusSearchIcon(false, false, false), 8000)
            book.value = bookByUrl
            selectedAuthors.value = book.value.authors
            selectedCategories.value = book.value.categories
            selectedSeries.value = book.value.series
          }
        })
        .catch(() => {
          btnSearchDisabled.value = false
          toast.add({
            severity: 'error',
            summary: 'Błąd',
            detail: 'Błąd podczas wyszukiwania książki...',
            life: 3500,
          })
        })
  }
}

function resetForm() {
  book.value = {
    id: 0,
    series: null,
    authors: [],
    categories: [],
    title: '',
    description: '',
    cover: '',
    bookInSeriesNo: '',
  }
  selectedAuthors.value = []
  selectedCategories.value = []
  selectedSeries.value = null
  submitted.value = false
  btnSaveDisabled.value = false
}

function changeStatusSearchIcon(busy: boolean, saved: boolean, error: boolean) {
  btnSearchShowBusy.value = busy
  btnSearchShowError.value = error
  btnSearchShowOk.value = saved
}

//
//------------------------------------------------ERROR----------------------------------------------------------
//
const submitted = ref(false)
const submittedSearch = ref(false)

const showError = (msg: string) => {
  toast.add({
    severity: 'error',
    summary: 'Error Message',
    detail: msg,
    life: 3000,
  })
}
const isSearchNotValid = () => {
  return showErrorUrl()
}
const isNotValid = () => {
  return showErrorTitle() || showErrorAuthor() || showErrorCategory() || showErrorCover()
}
const showErrorUrl = () => {
  return submittedSearch.value && searchUrl.value.length === 0
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
  <Toast/>
  <TheMenuLibrary/>
  <AddDialog
      v-model:visible="showAddModal"
      label2="Nazwisko:"
      msg="Dodaj autora"
      label1="Imię:"
      @save="saveAuthor"
      @cancel="showAddModal = false"
  />
  <AddDialog
      v-model:visible="showAddCategoryModal"
      msg="Dodaj kategorię"
      label1="Nazwa:"
      @save="saveCategory"
      @cancel="showAddCategoryModal = false"
  />

  <div class="m-4 max-w-6xl mx-auto">
    <form @submit.stop.prevent="saveBook">
      <Panel>
        <template #header>
          <IconButton
              title="Powrót do listy książek"
              icon="pi pi-fw pi-list"
              @click="() => router.push({ name: 'Books' })"
          />
          <div class="w-full flex justify-center">
            <h2>
              {{ isEdit ? `Edycja książki: ${book?.title}` : 'Nowa książka' }}
            </h2>
          </div>
        </template>
        <Fieldset v-if="!isEdit" legend="URL" class="flex flex-col">
          <!-- URL -->
          <div class="flex flex-col mt-3">
            <InputText id="url" v-model="searchUrl" :class="{ 'p-invalid': showErrorUrl() }"/>
            <small class="p-error">{{ showErrorUrl() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
          </div>

          <!--   BTN SEARCH -->
          <div class="flex justify-center">
            <OfficeButton
                text="wyszukaj"
                type="button"
                btn-type="office-regular"
                :loading="btnSearchShowBusy"
                :btn-disabled="btnSearchDisabled"
                @click="findBook()"
            />
          </div>
        </Fieldset>

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
                <OfficeIconButton
                    title="Dodaj autora"
                    :icon="bookStore.loadingAuthors ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"
                    style="height: 35px; width: 35px; padding: 0"
                    class="mt-1 self-center"
                    @click="showAddModal = true"
                />
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
                <OfficeIconButton
                    title="Dodaj kategorię"
                    :icon="bookStore.loadingCategories ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"
                    style="height: 35px; width: 35px; padding: 0"
                    class="mt-1 self-center"
                    @click="showAddCategoryModal = true"
                />
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
              v-if="!isEdit"
              text="Reset"
              type="button"
              btn-type="office-regular"
              @click="resetForm()"
          />
          <OfficeButton
              text="zapisz"
              btn-type="office-save"
              type="submit"
              :loading="btnShowBusy"
              :btn-disabled="isSaveBtnDisabled"
          />
        </div>
      </Panel>
    </form>
  </div>
</template>

<style scoped></style>
