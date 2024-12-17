<script setup lang="ts">
import {
  computed,
  type DefineComponent,
  ref,
  watchEffect,
} from 'vue'
import type {PropType} from 'vue'
import {useUserbooksStore} from '../../stores/userbooks'
import type {Book, Series, UserBook} from '../../types/Book'
import {useBooksStore} from '../../stores/books'
import {useToast} from 'primevue/usetoast'
import AddBookToShellDialog from '../../components/library/AddEditUserBookDialog.vue'
import SeriesBook from '../../components/library/SeriesBook.vue'
import {UtilsService} from '../../service/UtilsService'
import AddEditSeriesDialog from '../../components/library/AddEditSeriesDialog.vue'
import NewBookDialog from '../../components/library/NewBookDialog.vue'
import type {AxiosError} from "axios";

const booksStore = useBooksStore()
const userbookStore = useUserbooksStore()
const toast = useToast()

const props = defineProps({
  series: {
    type: Object as PropType<Series>,
    required: true,
  },
})

const carouselKey = ref<number>(0)
const booksInSeries = ref<Book[]>([])
const tempSeries = ref<Series>({
  id: 0,
  url: '',
  hasNewBooks: false,
  checkDate: null,
  description: '',
  title: '',
})

watchEffect(async () => {
  tempSeries.value = props.series
  await refresh()
})

async function refresh() {
  const result = await booksStore.getBooksInSeriesFromDb(props.series?.id)
  booksInSeries.value = result.sort(
      (a: Book, b: Book) => Number.parseFloat(a.bookInSeriesNo) - Number.parseFloat(b.bookInSeriesNo),
  )
  carouselKey.value++
}

async function findNewBookInSeries(url: string) {
  booksStore
      .getNewBooksInSeriesFromDb(props.series?.id, url)
      .then((result: Book[]) => {
        if (result && result.length > 0) {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Znaleziono ' + result.length + ' ' + getBooksCountLabel(result.length),
            life: 3000,
          })
          booksInSeries.value.push(
              ...result.sort(
                  (a: Book, b: Book) => Number.parseFloat(a.bookInSeriesNo) - Number.parseFloat(b.bookInSeriesNo),
              ),
          )
        } else if (result && result.length == 0) {
          toast.add({
            severity: 'info',
            summary: 'Potwierdzenie',
            detail: 'Nie znaleziono nowych książek.',
            life: 3000,
          })
          booksInSeries.value.push(
              ...result.sort(
                  (a: Book, b: Book) => Number.parseFloat(a.bookInSeriesNo) - Number.parseFloat(b.bookInSeriesNo),
              ),
          )
        }
        booksStore.getSeriesByIdFromDb(props.series?.id).then((series: Series | null) => {
          if (series) tempSeries.value = series
        })
      })
      .catch((reason: AxiosError) => {
        toast.add({
          severity: 'error',
          summary: reason?.message,
          detail: 'Wystąpił błąd',
          life: 3000,
        })
      })
  booksStore.getSeriesByIdFromDb(props.series?.id).then((series: Series | null) => {
    if (series) tempSeries.value = series
  })
}

//
//-------------------------------------------------USERBOOK-------------------------------------------------
//
const showUserbookDialog = ref<boolean>(false)
const tempIdBook = ref<number>(0)
const addUserbook = (book: Book) => {
  tempIdBook.value = book.id
  showUserbookDialog.value = true
}
const submitAddUserbook = async (newUserbook: UserBook) => {
  showUserbookDialog.value = false
  if (newUserbook) {
    await userbookStore.addUserbookDb(newUserbook).then(() => {
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Dodano książkę na półkę: ' + newUserbook.book?.title,
        life: 3000,
      })
      refresh()
    }).catch((reason: AxiosError) => {
      toast.add({
        severity: 'error',
        summary: reason?.message,
        detail: 'Błąd podczas dodawania książki na półkę.',
        life: 3000,
      })
    })
  }
}

//
//-------------------------------------------------------SERIES
//
const showSeriesDialog = ref<boolean>(false)
const tempIdSeries = ref<number>(0)
const editSeries = () => {
  if (tempSeries.value) {
    tempIdSeries.value = tempSeries.value?.id
  }
  showSeriesDialog.value = true
}
const submitSeries = async (series: Series) => {
  showSeriesDialog.value = false
  if (series && series.id > 0) {
    console.log('submitSeries(): EDIT')
    booksStore
        .updateSeriesDb(series)
        .then((res: Series) => {
          tempSeries.value = res
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano cykl: ' + series.title,
            life: 3000,
          })
        })
        .catch((reason:AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas aktualizacji cyklu: ' + series.title,
            life: 3000,
          })
        })
  }
}

//
//----------------------------BOOK
//
const showAddNewBookDialog = ref<boolean>(false)
const bookToAdd = ref<Book>({
  id: 0,
  title: '',
  series: null,
  bookInSeriesNo: '',
  description: '',
  authors: [],
  categories: [],
  cover: '',
})
const addBook = (book: Book) => {
  console.log('showAddNewBookDialog', book)
  bookToAdd.value = book
  showAddNewBookDialog.value = true
}
const afterSavedBook = async () => {
  showAddNewBookDialog.value = false
  await refresh()
}

const responsiveOptions = ref([
  {
    breakpoint: '1700px',
    numVisible: 4,
    numScroll: 1,
  },
  {
    breakpoint: '1400px',
    numVisible: 3,
    numScroll: 1,
  },
  {
    breakpoint: '1099px',
    numVisible: 2,
    numScroll: 1,
  },
  {
    breakpoint: '767px',
    numVisible: 1,
    numScroll: 1,
  },
])

function getBooksCountLabel(count: number) {
  if (count === 1) {
    return 'książka'
  } else if (count > 1 && count < 5) {
    return 'książki'
  } else {
    return 'książek'
  }
}

const menuRef = ref<DefineComponent | null>(null)
const items = ref([
  {
    label: 'Odświerz',
    icon: 'pi pi-refresh',
    command: () => {
      refresh()
    },
  },
  {
    label: 'Edytuj',
    icon: 'pi pi-file-edit',
    command: () => {
      editSeries()
    },
  },
  {
    separator: true,
  },
  {
    label: 'Poszukaj nowe',
    items: [
      {
        label: 'Legimi',
        icon: 'pi pi-search',
        disabled: computed(() => !tempSeries.value?.url.includes('legimi.pl')),
        command: () => {
          const result: string[] = UtilsService.findPatternInString(
              tempSeries.value?.url,
              'legimi.pl',
              ';;',
          )
          if (result.length > 0) {
            findNewBookInSeries(result[0])
          }
        },
      },
      {
        label: 'Upoluj ebooka',
        icon: 'pi pi-search',
        disabled: computed(() => !tempSeries.value?.url.includes('upolujebooka.pl')),
        command: () => {
          const result: string[] = UtilsService.findPatternInString(
              tempSeries.value?.url,
              'upolujebooka.pl',
              ';;',
          )
          if (result.length > 0) {
            findNewBookInSeries(result[0])
          }
        },
      },
      {
        label: 'Lubimy czytać',
        icon: 'pi pi-search',
        disabled: computed(() => !tempSeries.value?.url.includes('lubimyczytac.pl')),
        command: () => {
          const result: string[] = UtilsService.findPatternInString(
              tempSeries.value?.url,
              'lubimyczytac.pl',
              ';;',
          )
          if (result.length > 0) {
            findNewBookInSeries(result[0])
          }
        },
      },
    ],
  },
])
const toggle = (event: Event) => {
  menuRef.value?.toggle(event)
}

</script>

<template>
  <AddBookToShellDialog
      v-model:visible="showUserbookDialog"
      :id-book="tempIdBook"
      @save="submitAddUserbook"
      @cancel="showUserbookDialog = false"
  />

  <AddEditSeriesDialog
      v-model:visible="showSeriesDialog"
      :id-series="tempIdSeries"
      @save="submitSeries"
      @cancel="showSeriesDialog = false"
  />

  <NewBookDialog
      v-model:visible="showAddNewBookDialog"
      :book-to-add="bookToAdd"
      @close="afterSavedBook"
  />
  <Panel class="mb-10 w-full text-color">
    <template #header>
      <div class="flex items-center gap-4">
        <p class="font-bold text-3xl ml-2">
          <span class="text-primary">{{ props.series.title }} </span> - {{ booksInSeries.length }}
          {{ getBooksCountLabel(booksInSeries.length) }}
        </p>
        <div v-if="booksStore.loadingBooksInSeries">
          <ProgressSpinner class="ml-2 mt-1" style="width: 30px; height: 30px" stroke-width="5"/>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <Tag
            v-if="tempSeries && tempSeries.hasNewBooks"
            value="Znaleziono nowe książki"
            severity="success"
            class="larger-tag"
        />
        <span v-else/>
        <span class=""
        >Sprawdzono: <span class="text-sm"> {{ tempSeries.checkDate }}</span></span
        >
      </div>
    </template>
    <template #icons>
      <Button icon="pi pi-cog" severity="secondary" rounded text @click="toggle"/>
      <Menu ref="menuRef" id="config_menu" :model="items" popup/>
    </template>
    <div class="card">
      <!--                verticalViewPortHeight="300px" -->
      <Carousel
          :value="booksInSeries"
          :responsive-options="responsiveOptions"
          :num-visible="4"
          :num-scroll="2"
          class="w-full"
          :key="carouselKey"
      >
        <template #item="slotProps">
          <SeriesBook
              :book="slotProps.data"
              @new-userbook="addUserbook"
              @exist-userbook="addUserbook"
              @new-book="addBook"
          />
        </template>
      </Carousel>
    </div>
  </Panel>
</template>

<style scoped></style>
