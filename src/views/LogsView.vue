<script setup lang="ts">
import {useLogsStore} from '../stores/logs'
import TheMenu from '../components/TheMenu.vue'
import {onMounted, ref} from 'vue'
import {FilterMatchMode, FilterOperator} from '@primevue/core/api'
import moment from 'moment'
import {useToast} from 'primevue/usetoast'
import type {DataTablePageEvent} from 'primevue/datatable'

const toast = useToast()
const logStore = useLogsStore()

//filter
const filters = ref()
const initFilters = () => {
  filters.value = {
    global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    level: {value: null, matchMode: FilterMatchMode.CONTAINS},
    timestamp: {
      operator: FilterOperator.AND,
      constraints: [{value: null, matchMode: FilterMatchMode.DATE_IS}],
    },
    message: {value: null, matchMode: FilterMatchMode.CONTAINS},
    logger: {value: null, matchMode: FilterMatchMode.CONTAINS},
  }
}
initFilters()
const clearFilter = () => {
  initFilters()
}

const formatDate = (value: Date) => {
  return moment(value).format('YYYY-MM-DD HH:mm:ss.SSS')
}
const expandedRows = ref([])
const logLevels = ref<string[]>(['INFO', 'DEBUG', 'WARN', 'ERROR'])
const title = ref<string>('')
const dateFrom = ref<Date>(new Date())
const dateTo = ref<Date>(new Date())
const selectedLevel = ref<string>('')
const searchLogs = () => {
  logStore
      .getLogsFromDb(
          moment(dateFrom.value).format('YYYY-MM-DD'),
          moment(dateTo.value).format('YYYY-MM-DD'),
          selectedLevel.value,
      )
      .then(() => {
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Pobrano logi.',
          life: 3000,
        })
        title.value =
            ': ' +
            moment(dateFrom.value).format('YYYY-MM-DD') +
            ' - ' +
            moment(dateTo.value).format('YYYY-MM-DD')
        if (selectedLevel.value && selectedLevel.value !== '') {
          title.value += ', ' + selectedLevel.value
        }
      })
      .catch(() => {
        toast.add({
          severity: 'error',
          summary: 'Błąd',
          detail: 'Nie udało się pobrać logów.',
          life: 3000,
        })
      })
}
const handleRowsPerPageChange = (event: DataTablePageEvent) => {
  localStorage.setItem('rowsPerPageLogs', event.rows.toString())
}
onMounted(() => {
  logStore.getTodayLogsFromDb()
  title.value = ' - DZISIEJSZE'
})
</script>

<template>
  <TheMenu/>

  <Panel>
    <template #header>
      <div class="w-full flex justify-center gap-4">
        <h3 class="color-green">LISTA LOGÓW {{ title }}</h3>
        <div v-if="logStore.loadingLogs">
          <ProgressSpinner class="ml-3" style="width: 35px; height: 35px" stroke-width="5"/>
        </div>
      </div>
    </template>
    <DataTable
        v-if="!logStore.loadingLogs"
        v-model:expanded-rows="expandedRows"
        v-model:filters="filters"
        :value="logStore.getLogs"
        :loading="logStore.loadingLogs"
        striped-rows
        removable-sort
        paginator
        :rows="logStore.rowsPerPage"
        :rows-per-page-options="[10, 20, 50, 75, 100]"
        table-style="min-width: 50rem"
        filter-display="menu"
        :global-filter-fields="['logger', 'message']"
        @page="handleRowsPerPageChange"
    >
      <template #header>
        <div class="flex justify-between">
          <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Wyczyść"
              outlined
              @click="clearFilter()"
          />
          <div class="flex gap-2">
            <DatePicker
                v-model="dateFrom"
                showIcon
                iconDisplay="input"
                class="w-36"
                dateFormat="yy-mm-dd"
            />
            <DatePicker
                v-model="dateTo"
                showIcon
                iconDisplay="input"
                class="w-36"
                dateFormat="yy-mm-dd"
            />
            <MultiSelect
                v-model="selectedLevel"
                :options="logLevels"
                placeholder="Wybierz..."
                :show-clear="true"
                style="min-width: 10rem; width: 10rem"
            />
            <Button
                type="button"
                icon="pi pi-search"
                label="Szukaj"
                outlined
                @click="searchLogs()"
            />
          </div>
          <IconField icon-position="left">
            <InputIcon>
              <i class="pi pi-search"/>
            </InputIcon>
            <InputText v-model="filters['global'].value" placeholder="wpisz tutaj..."/>
          </IconField>
        </div>
      </template>

      <template #empty>
        <h4 class="color-red" v-if="!logStore.loadingLogs">Nie znaleziono logów...</h4>
      </template>

      <template #loading>
        <h4>Ładowanie danych. Proszę czekać...</h4>
      </template>

      <Column expander style="width: 5rem"/>

      <!--      DATE  -->
      <Column field="timestamp" header="Data" :sortable="true" style="min-width: 13rem">
        <template #body="{ data }">
          {{ formatDate(data.timestamp) }}
        </template>
        <template #filter="{ filterModel }">
          <DatePicker v-model="filterModel.value" dateFormat="yy-mm-dd" placeholder="yyyy-dd-mm"/>
        </template>
      </Column>

      <!--      LOG LEVEL  -->
      <Column
          field="level"
          header="Level"
          :sortable="true"
          style="min-width: 5rem"
          filter-field="level"
          :show-filter-match-modes="false"
      >
        <template #body="slotProps">
          {{ slotProps.data[slotProps.field] }}
        </template>
        <template #filter="{ filterModel }">
          <Select
              v-model="filterModel.value"
              :options="logStore.getLogLevels"
              placeholder="Wybierz..."
              class="p-column-filter"
              style="min-width: 12rem; width: 12rem"
              :show-clear="true"
          />
        </template>
      </Column>

      <!--     PROCESS ID -->
      <Column field="processId" header="Process ID" :sortable="true" style="min-width: 5rem"/>

      <!--      THREAD  -->
      <Column field="thread" header="Thread" :sortable="true" style="min-width: 5rem"/>

      <!--      LOGGER  -->
      <Column field="logger" header="Logger" :sortable="true">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..."/>
        </template>
      </Column>

      <!--      MESSAGE  -->
      <Column field="message" header="Message" :sortable="true">
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..."/>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="p-3">
          <h4>Message:</h4>
          <Textarea v-model="slotProps.data.message" rows="4" cols="30" fluid/>
        </div>
      </template>
    </DataTable>
  </Panel>
</template>

<style scoped></style>
