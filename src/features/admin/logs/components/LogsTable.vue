<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { FilterMatchMode } from '@primevue/core/api';
  import type { DataTablePageEvent } from 'primevue/datatable';
  import LogLevelTag from '@/features/admin/logs/components/LogLevelTag.vue';
  import { LOG_LEVEL_STYLES } from '@/features/admin/logs/logLevelStyles';
  import type { LogRow } from '@/features/admin/logs/types';
  import { UtilsService } from '@/service/UtilsService';

  const ROWS_PER_PAGE_KEY = 'rowsPerPageLogs';

  const props = withDefaults(
    defineProps<{
      rows: LogRow[];
      loading?: boolean;
      /** Historia: paginacja + sortowanie; podgląd na żywo: lista ciągła bez sortowania. */
      paginated?: boolean;
      /** Historia pokazuje pełną datę, podgląd na żywo tylko godzinę. */
      showDate?: boolean;
      /** Ustawiona = tabela przewija się wewnętrznie (podgląd na żywo). */
      scrollHeight?: string;
      emptyTitle?: string;
      emptyHint?: string;
    }>(),
    {
      loading: false,
      paginated: false,
      showDate: true,
      scrollHeight: undefined,
      emptyTitle: 'Brak wpisów dla wybranych filtrów',
      emptyHint: 'Zmień filtry albo wyczyść wyszukiwanie.',
    }
  );

  const tableRef = ref<{ $el: HTMLElement } | null>(null);

  const filters = ref({ global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS } });
  const expandedRows = ref<Record<string, boolean>>({});

  const readRowsPerPage = (): number => {
    try {
      return parseInt(localStorage.getItem(ROWS_PER_PAGE_KEY) || '50', 10);
    } catch {
      return 50;
    }
  };
  const rowsPerPage = ref(readRowsPerPage());
  const handlePage = (event: DataTablePageEvent) => {
    rowsPerPage.value = event.rows;
    try {
      localStorage.setItem(ROWS_PER_PAGE_KEY, event.rows.toString());
    } catch {
      // brak localStorage - preferencja po prostu nie zostanie zapamiętana
    }
  };

  const firstLine = (message: string) => message.split('\n', 1)[0];
  const extraLines = (message: string) => message.split('\n').length - 1;

  const rowClass = (row: LogRow) =>
    row.gap ? 'bg-surface-100 italic dark:bg-surface-800' : LOG_LEVEL_STYLES[row.level].row;

  const timeColumnWidth = computed(() => (props.showDate ? 'min-width: 13rem' : 'min-width: 8rem'));

  /** Kontener przewijania tabeli - potrzebny podglądowi na żywo do auto-scrolla. */
  function getScrollContainer(): HTMLElement | null {
    return tableRef.value?.$el.querySelector<HTMLElement>('.p-datatable-table-container') ?? null;
  }
  defineExpose({ getScrollContainer });
</script>

<template>
  <DataTable
    ref="tableRef"
    v-model:expanded-rows="expandedRows"
    v-model:filters="filters"
    :value="rows"
    :loading="loading"
    data-key="id"
    size="small"
    class="font-mono text-[13px]"
    :paginator="paginated"
    :rows="rowsPerPage"
    :rows-per-page-options="[20, 50, 100, 200]"
    :sort-field="paginated ? 'timestamp' : undefined"
    :sort-order="paginated ? -1 : undefined"
    removable-sort
    :scrollable="!!scrollHeight"
    :scroll-height="scrollHeight"
    :global-filter-fields="['logger', 'message']"
    :row-class="rowClass"
    @page="handlePage"
  >
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3 font-sans">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="filters.global.value" placeholder="Szukaj w wynikach (logger, treść)" class="w-80" />
        </IconField>
        <div class="flex items-center gap-4 text-sm text-surface-600 dark:text-surface-400">
          <span>
            Wyświetlono <b class="font-semibold text-surface-900 dark:text-surface-0">{{ rows.length }}</b> wpisów
          </span>
          <slot name="header-actions" />
        </div>
      </div>
    </template>

    <template #empty>
      <div class="flex flex-col items-center gap-2 py-16 text-center font-sans">
        <span class="text-base font-medium text-surface-700 dark:text-surface-200">{{ emptyTitle }}</span>
        <span class="text-sm text-surface-600 dark:text-surface-400">{{ emptyHint }}</span>
      </div>
    </template>

    <Column expander style="width: 3rem" />

    <Column field="timestamp" header="Czas" :sortable="paginated" :style="timeColumnWidth">
      <template #body="{ data }">
        <span v-if="!data.gap" class="text-surface-600 dark:text-surface-400">
          {{ showDate ? UtilsService.formatDateTimeMs(data.timestamp) : UtilsService.formatTimeMs(data.timestamp) }}
        </span>
      </template>
    </Column>

    <Column field="level" header="Poziom" :sortable="paginated" style="min-width: 6rem">
      <template #body="{ data }">
        <LogLevelTag v-if="!data.gap" :level="data.level" />
      </template>
    </Column>

    <Column field="instance" header="Instancja" :sortable="paginated" style="min-width: 6rem">
      <template #body="{ data }">
        <span class="text-surface-700 dark:text-surface-200">{{ data.instance ?? '' }}</span>
      </template>
    </Column>

    <Column field="logger" header="Logger" :sortable="paginated" body-style="max-width: 16rem">
      <template #body="{ data }">
        <div class="truncate text-sky-700 dark:text-sky-300" :title="data.logger">{{ data.logger }}</div>
      </template>
    </Column>

    <Column field="message" header="Komunikat" body-style="max-width: 0; width: 100%">
      <template #body="{ data }">
        <div v-if="data.gap" class="truncate text-surface-600 dark:text-surface-400">{{ data.message }}</div>
        <div v-else class="flex items-baseline gap-2">
          <span class="truncate" :class="LOG_LEVEL_STYLES[data.level as keyof typeof LOG_LEVEL_STYLES].message">
            {{ firstLine(data.message) }}
          </span>
          <span
            v-if="extraLines(data.message) > 0"
            class="shrink-0 text-xs text-surface-500 dark:text-surface-400"
            :title="'Komunikat ma więcej linii (np. stacktrace) - rozwiń wiersz'"
          >
            +{{ extraLines(data.message) }} linii
          </span>
        </div>
      </template>
    </Column>

    <template #expansion="{ data }">
      <div v-if="data.gap" class="px-4 py-3 font-sans text-sm text-surface-600 dark:text-surface-400">
        Część wpisów nie dotarła do podglądu: aplikacja mogła się zrestartować albo bufor po stronie serwera został
        przewinięty. Pełną historię znajdziesz w zakładce Historia (z opóźnieniem do ok. 5 minut).
      </div>
      <div v-else class="flex flex-col gap-2.5 px-4 py-3">
        <div class="flex flex-wrap gap-x-6 gap-y-1 font-sans text-xs text-surface-600 dark:text-surface-400">
          <span>
            Czas:
            <span class="font-mono text-surface-800 dark:text-surface-200">
              {{ UtilsService.formatDateTimeMs(data.timestamp) }}
            </span>
          </span>
          <span>
            Wątek: <span class="font-mono text-surface-800 dark:text-surface-200">{{ data.thread }}</span>
          </span>
          <span>
            Instancja:
            <span class="font-mono text-surface-800 dark:text-surface-200">{{ data.instance ?? '-' }}</span>
          </span>
          <span>
            Logger: <span class="font-mono text-surface-800 dark:text-surface-200">{{ data.logger }}</span>
          </span>
        </div>
        <pre
          class="m-0 whitespace-pre-wrap break-words rounded-md border border-surface-200 bg-surface-0 p-3.5 font-mono text-xs leading-[18px] text-surface-700 [tab-size:4] dark:border-surface-700 dark:bg-surface-950 dark:text-surface-200"
          >{{ data.message }}</pre>
      </div>
    </template>
  </DataTable>
</template>
