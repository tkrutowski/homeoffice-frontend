<script setup lang="ts">
  import TheMenu from '@/components/TheMenu.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import { computed, ref, watch } from 'vue';
  import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
  import moment from 'moment';
  import { useToast } from 'primevue/usetoast';
  import type { DataTablePageEvent } from 'primevue/datatable';
  import { UtilsService } from '@/service/UtilsService';
  import { LOG_LEVELS, type LogLevel, type LogsRangeParams } from '@/features/admin/logs/types';
  import { useLogsRangeQuery, useTodayLogsQuery } from '@/features/admin/logs/queries/useLogsQueries';

  const ROWS_PER_PAGE_KEY = 'rowsPerPageLogs';

  const toast = useToast();

  // Zatwierdzone parametry wyszukiwania (po kliknięciu „Szukaj”); null = dzisiejsze logi.
  const searchParams = ref<LogsRangeParams | null>(null);
  const todayQuery = useTodayLogsQuery(() => searchParams.value === null);
  const rangeQuery = useLogsRangeQuery(searchParams);
  const activeQuery = computed(() => (searchParams.value === null ? todayQuery : rangeQuery));

  const logs = computed(() => activeQuery.value.data.value ?? []);
  const isLoading = computed(() => activeQuery.value.isFetching.value);
  const levelsInData = computed(() => Array.from(new Set(logs.value.map(log => log.level))));

  const title = computed(() => {
    const params = searchParams.value;
    if (!params) return ' - DZISIEJSZE';
    const levels = params.levels.length > 0 ? ', ' + params.levels.join(', ') : '';
    return `: ${params.from} - ${params.to}${levels}`;
  });

  // Formularz wyszukiwania
  const dateFrom = ref<Date>(new Date());
  const dateTo = ref<Date>(new Date());
  const selectedLevels = ref<LogLevel[]>([]);
  const logLevels = [...LOG_LEVELS];

  const searchLogs = () => {
    const next: LogsRangeParams = {
      from: moment(dateFrom.value).format('YYYY-MM-DD'),
      to: moment(dateTo.value).format('YYYY-MM-DD'),
      levels: [...selectedLevels.value],
    };
    // Te same parametry = ten sam queryKey, więc zmiana ref-a nie wywoła requestu - odświeżamy ręcznie.
    if (searchParams.value && JSON.stringify(searchParams.value) === JSON.stringify(next)) {
      rangeQuery.refetch();
    } else {
      searchParams.value = next;
    }
  };

  watch(
    () => rangeQuery.dataUpdatedAt.value,
    updatedAt => {
      if (updatedAt > 0) {
        toast.add({ severity: 'success', summary: 'Potwierdzenie', detail: 'Pobrano logi.', life: 3000 });
      }
    }
  );
  watch(
    () => [todayQuery.error.value, rangeQuery.error.value],
    ([todayError, rangeError]) => {
      if (todayError || rangeError) {
        toast.add({ severity: 'error', summary: 'Błąd', detail: 'Nie udało się pobrać logów.', life: 3000 });
      }
    }
  );

  // Filtry tabeli
  const filters = ref();
  const initFilters = () => {
    filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      level: { value: null, matchMode: FilterMatchMode.CONTAINS },
      timestamp: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      message: { value: null, matchMode: FilterMatchMode.CONTAINS },
      logger: { value: null, matchMode: FilterMatchMode.CONTAINS },
    };
  };
  initFilters();

  const expandedRows = ref([]);

  const readRowsPerPage = (): number => {
    try {
      return parseInt(localStorage.getItem(ROWS_PER_PAGE_KEY) || '20', 10);
    } catch {
      return 20;
    }
  };
  const rowsPerPage = ref(readRowsPerPage());
  const handleRowsPerPageChange = (event: DataTablePageEvent) => {
    rowsPerPage.value = event.rows;
    try {
      localStorage.setItem(ROWS_PER_PAGE_KEY, event.rows.toString());
    } catch {
      // brak localStorage - preferencja po prostu nie zostanie zapamiętana
    }
  };
</script>

<template>
  <MainPageShell>
    <template #top>
      <TheMenu />
    </template>

    <Panel class="mx-2 my-3">
      <template #header>
        <div class="w-full flex justify-center gap-4">
          <h3 class="color-green">LISTA LOGÓW {{ title }}</h3>
          <div v-if="isLoading">
            <ProgressSpinner class="ml-3" style="width: 35px; height: 35px" stroke-width="5" />
          </div>
        </div>
      </template>
      <DataTable
        v-model:expanded-rows="expandedRows"
        v-model:filters="filters"
        :value="logs"
        :loading="isLoading"
        striped-rows
        removable-sort
        paginator
        :rows="rowsPerPage"
        :rows-per-page-options="[10, 20, 50, 75, 100]"
        table-style="min-width: 50rem"
        filter-display="menu"
        :global-filter-fields="['logger', 'message']"
        @page="handleRowsPerPageChange"
      >
        <template #header>
          <div class="flex justify-between">
            <Button type="button" icon="pi pi-filter-slash" label="Wyczyść" outlined @click="initFilters()" />
            <div class="flex gap-2">
              <DatePicker v-model="dateFrom" showIcon iconDisplay="input" class="w-36" dateFormat="yy-mm-dd" />
              <DatePicker v-model="dateTo" showIcon iconDisplay="input" class="w-36" dateFormat="yy-mm-dd" />
              <MultiSelect
                v-model="selectedLevels"
                :options="logLevels"
                placeholder="Wybierz..."
                :show-clear="true"
                style="min-width: 10rem; width: 10rem"
              />
              <Button type="button" icon="pi pi-search" label="Szukaj" outlined @click="searchLogs()" />
            </div>
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="wpisz tutaj..." />
            </IconField>
          </div>
        </template>

        <template #empty>
          <h4 class="color-red" v-if="!isLoading">Nie znaleziono logów...</h4>
        </template>

        <template #loading>
          <h4>Ładowanie danych. Proszę czekać...</h4>
        </template>

        <Column expander style="width: 5rem" />

        <!--      DATE  -->
        <Column field="timestamp" header="Data" :sortable="true" style="min-width: 13rem">
          <template #body="{ data }">
            {{ UtilsService.formatDateTimeMs(data.timestamp) }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker v-model="filterModel.value" dateFormat="yy-mm-dd" placeholder="yyyy-dd-mm" />
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
          <template #filter="{ filterModel }">
            <Select
              v-model="filterModel.value"
              :options="levelsInData"
              placeholder="Wybierz..."
              class="p-column-filter"
              style="min-width: 12rem; width: 12rem"
              :show-clear="true"
            />
          </template>
        </Column>

        <!--     PROCESS ID -->
        <Column field="processId" header="Process ID" :sortable="true" style="min-width: 5rem" />

        <!--      THREAD  -->
        <Column field="thread" header="Thread" :sortable="true" style="min-width: 5rem" />

        <!--      LOGGER  -->
        <Column field="logger" header="Logger" :sortable="true">
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..." />
          </template>
        </Column>

        <!--      MESSAGE  -->
        <Column field="message" header="Message" :sortable="true">
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..." />
          </template>
        </Column>

        <template #expansion="slotProps">
          <div class="p-3">
            <h4>Message:</h4>
            <Textarea v-model="slotProps.data.message" rows="4" cols="30" fluid />
          </div>
        </template>
      </DataTable>
    </Panel>
  </MainPageShell>
</template>
