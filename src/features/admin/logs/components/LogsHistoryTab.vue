<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import moment from 'moment';
  import { useToast } from 'primevue/usetoast';
  import LogLevelFilter from '@/features/admin/logs/components/LogLevelFilter.vue';
  import LogsTable from '@/features/admin/logs/components/LogsTable.vue';
  import { useLogsRangeQuery } from '@/features/admin/logs/queries/useLogsQueries';
  import {
    DEFAULT_HISTORY_LIMIT,
    HISTORY_LIMITS,
    KNOWN_INSTANCES,
    LOG_LEVELS,
    MAX_RANGE_DAYS,
    type LogLevel,
    type LogsRangeParams,
  } from '@/features/admin/logs/types';
  import { UtilsService } from '@/service/UtilsService';

  const API_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

  const toast = useToast();

  // Formularz (wartości "robocze"; do zapytania trafiają dopiero po kliknięciu „Pobierz logi”)
  const dateFrom = ref<Date>(moment().startOf('day').toDate());
  const dateTo = ref<Date>(moment().add(1, 'day').startOf('day').toDate());
  const selectedLevels = ref<LogLevel[]>([...LOG_LEVELS]);
  const instance = ref<string | null>(null);
  const limit = ref<number>(DEFAULT_HISTORY_LIMIT);

  const rangeError = computed<string | null>(() => {
    const from = moment(dateFrom.value);
    const to = moment(dateTo.value);
    if (!dateFrom.value || !dateTo.value) return 'Podaj daty „Od” i „Do”.';
    if (!from.isBefore(to)) return 'Data „Od” musi być wcześniejsza niż „Do”.';
    if (to.diff(from, 'days', true) > MAX_RANGE_DAYS) return `Zakres nie może przekraczać ${MAX_RANGE_DAYS} dni.`;
    return null;
  });

  function buildParams(): LogsRangeParams {
    const allLevels = selectedLevels.value.length === LOG_LEVELS.length;
    return {
      from: moment(dateFrom.value).format(API_DATE_FORMAT),
      to: moment(dateTo.value).format(API_DATE_FORMAT),
      levels: allLevels ? [] : [...selectedLevels.value],
      limit: limit.value,
      instance: instance.value?.trim() || null,
    };
  }

  // Zatwierdzone parametry; na wejściu od razu pobieramy dzisiejsze logi.
  const committed = ref<LogsRangeParams | null>(buildParams());
  const query = useLogsRangeQuery(committed);

  const logs = computed(() => query.data.value?.logs ?? []);
  const truncated = computed(() => query.data.value?.truncated ?? false);
  const levelCounts = computed(() => {
    const counts: Partial<Record<LogLevel, number>> = {};
    for (const log of logs.value) counts[log.level] = (counts[log.level] ?? 0) + 1;
    return counts;
  });

  let userTriggered = false;
  function fetchLogs() {
    if (rangeError.value) return;
    const next = buildParams();
    userTriggered = true;
    // Te same parametry = ten sam queryKey, więc zmiana ref-a nie wywoła requestu - odświeżamy ręcznie.
    if (committed.value && JSON.stringify(committed.value) === JSON.stringify(next)) {
      query.refetch();
    } else {
      committed.value = next;
    }
  }

  function setQuickRange(from: Date, to: Date) {
    dateFrom.value = from;
    dateTo.value = to;
    fetchLogs();
  }
  const quickToday = () =>
    setQuickRange(moment().startOf('day').toDate(), moment().add(1, 'day').startOf('day').toDate());
  // „Do” = teraz (nowszych wpisów i tak nie ma). Jeden `now` dla obu końców, żeby "7 dni" nie wyszło
  // o minutę ponad limit backendu.
  const quickLast = (amount: number, unit: 'hour' | 'days') => {
    const now = moment();
    setQuickRange(now.clone().subtract(amount, unit).toDate(), now.toDate());
  };
  const quickLastHour = () => quickLast(1, 'hour');
  const quickLastWeek = () => quickLast(MAX_RANGE_DAYS, 'days');

  watch(
    () => query.dataUpdatedAt.value,
    () => {
      if (!userTriggered) return;
      userTriggered = false;
      toast.add({ severity: 'success', summary: 'Potwierdzenie', detail: 'Pobrano logi.', life: 3000 });
    }
  );
  watch(
    () => query.error.value,
    error => {
      if (!error) return;
      userTriggered = false;
      toast.add({
        severity: 'error',
        summary: 'Błąd',
        detail: UtilsService.getApiErrorMessage(error, 'Nie udało się pobrać logów.'),
        life: 5000,
      });
    }
  );
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      class="flex flex-col gap-4 rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-700 dark:bg-surface-900"
    >
      <div class="flex flex-wrap items-end gap-5">
        <div class="flex flex-col gap-1.5">
          <label for="logs-from" class="text-xs font-medium text-surface-600 dark:text-surface-400">Od</label>
          <DatePicker
            v-model="dateFrom"
            input-id="logs-from"
            show-time
            hour-format="24"
            date-format="yy-mm-dd"
            show-icon
            icon-display="input"
            class="w-52"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="logs-to" class="text-xs font-medium text-surface-600 dark:text-surface-400">Do (wyłącznie)</label>
          <DatePicker
            v-model="dateTo"
            input-id="logs-to"
            show-time
            hour-format="24"
            date-format="yy-mm-dd"
            show-icon
            icon-display="input"
            class="w-52"
          />
        </div>
        <div class="flex gap-2">
          <Button type="button" label="Dziś" outlined severity="secondary" @click="quickToday" />
          <Button type="button" label="Ostatnia godzina" outlined severity="secondary" @click="quickLastHour" />
          <Button type="button" label="7 dni" outlined severity="secondary" @click="quickLastWeek" />
        </div>

        <div class="flex-1" />

        <div class="flex flex-col gap-1.5">
          <label for="logs-instance" class="text-xs font-medium text-surface-600 dark:text-surface-400"
            >Instancja</label
          >
          <Select
            v-model="instance"
            input-id="logs-instance"
            :options="[...KNOWN_INSTANCES]"
            editable
            show-clear
            placeholder="Wszystkie"
            class="w-44"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="logs-limit" class="text-xs font-medium text-surface-600 dark:text-surface-400">Limit</label>
          <Select v-model="limit" input-id="logs-limit" :options="[...HISTORY_LIMITS]" class="w-28" />
        </div>
        <Button
          type="button"
          icon="pi pi-refresh"
          label="Pobierz logi"
          :loading="query.isFetching.value"
          :disabled="!!rangeError"
          @click="fetchLogs"
        />
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <LogLevelFilter v-model="selectedLevels" :counts="levelCounts" />
        <span v-if="rangeError" class="text-sm text-red-600 dark:text-red-400" role="alert">{{ rangeError }}</span>
      </div>
    </div>

    <Message v-if="truncated" severity="warn" :closable="false">
      Wyświetlono najwcześniejsze {{ logs.length }} wpisów — zawęź zakres lub filtry, aby zobaczyć resztę.
    </Message>

    <LogsTable
      :rows="logs"
      :loading="query.isFetching.value"
      paginated
      empty-hint="Zmień zakres dat, poziomy lub instancję albo wyczyść wyszukiwanie."
    />

    <p class="text-xs text-surface-600 dark:text-surface-400">
      Historia pochodzi z S3 - wpisy nowsze niż ostatni zapis (do ok. 5 minut) mogą jeszcze nie być widoczne.
      Najświeższe logi znajdziesz w zakładce „Na żywo”.
    </p>
  </div>
</template>
