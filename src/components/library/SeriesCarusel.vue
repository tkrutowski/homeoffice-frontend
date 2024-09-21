<script setup lang="ts">
import {computed, PropType, ref, watchEffect} from "vue";
import {useUserbooksStore} from "@/stores/userbooks";
import {Book, Series, UserBook} from "@/types/Book";
import {useBooksStore} from "@/stores/books";
import {useToast} from "primevue/usetoast";
import AddBookToShellDialog from "@/components/library/AddEditUserBookDialog.vue";
import SeriesBook from "@/components/library/SeriesBook.vue";
import {UtilsService} from "@/service/UtilsService.ts";
import AddEditSeriesDialog from "@/components/library/AddEditSeriesDialog.vue";

const booksStore = useBooksStore();
const userbookStore = useUserbooksStore();
const toast = useToast();

const props = defineProps({
  series: {
    type: Object as PropType<Series>,
    required: true,
  },
});


const booksInSeries = ref<Book[]>([]);
const tempSeries = ref<Series | null>(null);

watchEffect(async () => {
  tempSeries.value = props.series;
  await refresh();
});

async function refresh() {
  const result = await booksStore.getBooksInSeriesFromDb(props.series?.id);
  booksInSeries.value = result.sort((a, b) => a.bookInSeriesNo - b.bookInSeriesNo);
}

async function findNewBookInSeries(url: string) {
  booksStore.getNewBooksInSeriesFromDb(props.series?.id, url)
      .then(result => {
        if (result && result.length > 0) {
          toast.add({
            severity: "success",
            summary: "Potwierdzenie",
            detail: "Znaleziono " + result.length + " " + getBooksCountLabel(result.length),
            life: 3000,
          });
          booksInSeries.value.push(...result.sort((a, b) => a.bookInSeriesNo - b.bookInSeriesNo));
        } else if (result && result.length == 0) {
          toast.add({
            severity: "info",
            summary: "Potwierdzenie",
            detail: "Nie znaleziono nowych książek.",
            life: 3000,
          });
          booksInSeries.value.push(...result.sort((a, b) => a.bookInSeriesNo - b.bookInSeriesNo));
        }
        booksStore.getSeriesByIdFromDb(props.series?.id).then(series => tempSeries.value = series)
      })
      .catch(() => {
        toast.add({
          severity: "error",
          summary: "Błąd",
          detail: "Wystąpił błąd",
          life: 3000,
        });
      })
  tempSeries.value = booksStore.getSeriesByIdFromDb(props.series?.id);
}

//
//-------------------------------------------------USERBOOK-------------------------------------------------
//
const showUserbookDialog = ref<boolean>(false);
const tempIdBook = ref<number>(0);
const addUserbook = (book: Book) => {
  tempIdBook.value = book.id;
  showUserbookDialog.value = true;
};
const submitAddUserbook = async (newUserbook: UserBook) => {
  showUserbookDialog.value = false;
  if (newUserbook) {
    const result = await userbookStore.addUserbookDb(newUserbook);
    if (result) {
      //update payment
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Dodano książkę na półkę: " + newUserbook.book?.title,
        life: 3000,
      });
    }
  }
};

//
//-------------------------------------------------------SERIES
//
const showSeriesDialog = ref<boolean>(false);
const tempIdSeries = ref<number>(0);
const editSeries = () => {
  tempIdSeries.value = tempSeries.value.id;
  showSeriesDialog.value = true;
};
const submitSeries = async (series: Series) => {
  showSeriesDialog.value = false;
  if (series && series.id > 0) {
    console.log("submitSeries(): EDIT");
    booksStore.updateSeriesDb(series)
        .then(res => {
          tempSeries.value = res;
          toast.add({
            severity: "success",
            summary: "Potwierdzenie",
            detail: "Zaaktualizowano cykl: " + series.title,
            life: 3000,
          });
        })
        .catch(() => {
          toast.add({
            severity: "error",
            summary: "Błąd",
            detail: "Błąd podczas aktualizacji cyklu: " + series.title,
            life: 3000,
          });
        })
  }
};


const responsiveOptions = ref([
  {
    breakpoint: '1700px',
    numVisible: 4,
    numScroll: 1
  },
  {
    breakpoint: '1400px',
    numVisible: 3,
    numScroll: 1
  },
  {
    breakpoint: '1099px',
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '767px',
    numVisible: 1,
    numScroll: 1
  }
])


function getBooksCountLabel(count) {
  if (count === 1) {
    return 'książka';
  } else if (count > 1 && count < 5) {
    return 'książki';
  } else {
    return 'książek';
  }
}


const menu = ref(null);
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
      editSeries();
    },
  },
  {
    separator: true
  },
  {
    label: 'Poszukaj nowe',
    items: [
      {
        label: 'Legimi',
        icon: 'pi pi-search',
        disabled: computed(() => !tempSeries.value?.url.includes('legimi.pl')),
        command: () => {
          const result: string[] = UtilsService.findPatternInString(tempSeries.value?.url, 'legimi.pl', ';;');
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
          const result: string[] = UtilsService.findPatternInString(tempSeries.value?.url, 'upolujebooka.pl', ';;');
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
          const result: string[] = UtilsService.findPatternInString(tempSeries.value?.url, 'lubimyczytac.pl', ';;');
          if (result.length > 0) {
            findNewBookInSeries(result[0])
          }
        },
      }
    ]
  },
]);
const toggle = (event) => {
  menu.value.toggle(event);
};
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

  <Panel toggleable class="mb-10">
    <template #header>
      <span
          class="font-bold text-3xl ml-2">{{ props.series.title }} - {{
          booksInSeries.length
        }} {{ getBooksCountLabel(booksInSeries.length) }}</span>
    </template>
    <template #footer>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <Tag
            v-if="tempSeries.hasNewBooks" value="Znaleziono nowe książki" severity="success"
            class="larger-tag"/>
        <span v-else/>
        <span class="text-surface-500 dark:text-surface-400">Sprawdzono: {{ tempSeries.checkDate }}</span>
      </div>
    </template>
    <template #icons>
      <Button icon="pi pi-cog" severity="secondary" rounded text @click="toggle"/>
      <Menu ref="menu" id="config_menu" :model="items" popup/>
    </template>
    <div class="card">
      <!--                verticalViewPortHeight="300px" -->
      <Carousel
          :value="booksInSeries"
          :responsive-options="responsiveOptions"
          :num-visible="5"
          :num-scroll="2"
      >
        <template #item="slotProps">

          <SeriesBook :book="slotProps.data" @new-userbook="addUserbook"/>
        </template>
      </Carousel>
    </div>
  </Panel>
</template>

<style scoped></style>
