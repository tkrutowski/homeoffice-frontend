<script setup lang="ts">
import TheMenuLibrary from '@/components/library/TheMenuLibrary.vue'
import {useUserbooksStore} from '@/stores/userbooks'
import UserBookLarge from '@/components/library/UserBookLarge.vue'
import {UtilsService} from '@/service/UtilsService'
import {ref} from 'vue'
import {useBooksStore} from '@/stores/books'
import SeriesCarousel from '@/components/library/SeriesCarusel.vue'
import type {Series} from '@/types/Book'

const userbookStore = useUserbooksStore()
const bookStore = useBooksStore()

if (userbookStore.userbooks.length === 0) userbookStore.getUserbooksFromDb()
if (bookStore.series.length === 0) bookStore.getSeriesFromDb()
UtilsService.getTypesForLibrary()

const responsiveOptions = ref([
  {
    breakpoint: '2200px',
    numVisible: 1,
    numScroll: 1,
  },
])

const showSeriesDialog = ref<boolean>(false)
const selectedSeries = ref<Series | null>(null)
const showSeries = (series: Series) => {
  selectedSeries.value = series
  showSeriesDialog.value = true
}
</script>

<template>
  <TheMenuLibrary/>
  <Dialog v-if="selectedSeries" v-model:visible="showSeriesDialog" header=" " modal style="max-width: 80vw">
    <series-carousel :series="selectedSeries"/>
  </Dialog>
  <div class="grid grid-cols-9 gap-4 m-6">
    <Card class="col-span-2">
      <template #title>
        <div class="flex justify-center">
          <span class="font-bold text-2xl">Nowe ksiązki</span>
        </div>
      </template>
      <template #content>
        <ScrollPanel style="width: 100%; height: 700px">
          <div
              v-for="series in bookStore.getSeriesHasNewBooks"
              :key="series.id"
              class="hover:bg-surface-100 hover:dark:bg-surface-800 border border-primary rounded-lg p-4 mb-4 cursor-pointer"
              @click="showSeries(series)"
          >
            <p class="pb-2">
              Cykl: <span class="text-xl font-semibold pl-2">{{ series.title }}</span>
            </p>
            <p class="pb-2">
              Data: <span class="font-semibold pl-2">{{ series.checkDate }}</span>
            </p>
          </div>
        </ScrollPanel>
      </template>
    </Card>

    <Panel class="col-span-7">
      <template #header>
        <div class="w-full flex justify-center gap-4">
          <span class="font-bold text-3xl ml-2 text-color">Aktualnie czytane...</span>
          <div v-if="userbookStore.loadingUserbooks">
            <ProgressSpinner style="width: 35px; height: 35px" stroke-width="5"/>
          </div>
        </div>
      </template>
      <Carousel
          :value="userbookStore.getBooksReadNow"
          :num-visible="1"
          :num-scroll="1"
          :responsive-options="responsiveOptions"
      >
        <template #item="slotProps">
          <div class="card flex justify-center">
            <UserBookLarge :userbook="slotProps.data"/>
          </div>
        </template>
      </Carousel>
    </Panel>
  </div>
</template>

<style scoped></style>
