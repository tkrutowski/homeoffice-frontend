<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import moment from 'moment';
  import { useToast } from 'primevue/usetoast';
  import LogLevelTag from '@/features/admin/logs/components/LogLevelTag.vue';
  import { useLogLevelsQuery } from '@/features/admin/logs/queries/useLogLevelsQueries';
  import {
    useResetLogLevelMutation,
    useSetLogLevelMutation,
  } from '@/features/admin/logs/queries/useLogLevelsMutations';
  import { LOG_LEVELS, type LogLevel } from '@/features/admin/logs/types';
  import { UtilsService } from '@/service/UtilsService';

  const TTL_SHORTCUTS = [
    { label: '15 min', minutes: 15 },
    { label: '1 h', minutes: 60 },
    { label: '4 h', minutes: 240 },
    { label: '24 h', minutes: 1440 },
  ];
  /** Dopisek po kropce: człony `[A-Za-z0-9_$]+` rozdzielone pojedynczymi kropkami, bez kropki na początku i końcu. */
  const SUFFIX_PATTERN = /^[A-Za-z0-9_$]+(\.[A-Za-z0-9_$]+)*$/;

  const toast = useToast();
  const query = useLogLevelsQuery();
  const setMutation = useSetLogLevelMutation();
  const resetMutation = useResetLogLevelMutation();

  const info = computed(() => query.data.value ?? null);
  const overrides = computed(() => info.value?.overrides ?? []);

  // Odliczanie do przywrócenia poziomu (odświeżane co sekundę)
  const now = ref(Date.now());
  let ticker: ReturnType<typeof setInterval> | null = null;
  onMounted(() => {
    ticker = setInterval(() => (now.value = Date.now()), 1000);
  });
  onBeforeUnmount(() => {
    if (ticker) clearInterval(ticker);
  });

  const remainingMs = (revertsAt: Date) => revertsAt.getTime() - now.value;

  // Po dojściu odliczania do zera odświeżamy listę (backend sam przywraca poziom po TTL).
  const expiredCount = computed(() => overrides.value.filter(o => remainingMs(o.revertsAt) <= 0).length);
  watch(expiredCount, count => {
    if (count > 0) query.refetch();
  });

  // Formularz
  const prefix = ref<string | null>(null);
  const suffix = ref('');
  const level = ref<LogLevel>('DEBUG');
  const ttl = ref<number | null>(null);

  watch(
    () => info.value?.defaultTtlMinutes,
    defaultTtl => {
      if (ttl.value === null && defaultTtl) ttl.value = defaultTtl;
    },
    { immediate: true }
  );

  const suffixError = computed(() =>
    suffix.value !== '' && !SUFFIX_PATTERN.test(suffix.value)
      ? 'Dopisek może zawierać litery, cyfry, „_” i „$”; człony oddzielaj pojedynczą kropką (bez kropki na początku i końcu).'
      : null
  );
  const loggerName = computed(() =>
    prefix.value ? (suffix.value ? `${prefix.value}.${suffix.value}` : prefix.value) : ''
  );
  const maxTtl = computed(() => info.value?.maxTtlMinutes ?? 1440);
  const ttlValid = computed(
    () => ttl.value !== null && Number.isInteger(ttl.value) && ttl.value >= 1 && ttl.value <= maxTtl.value
  );
  const canApply = computed(
    () => !!prefix.value && !suffixError.value && ttlValid.value && !setMutation.isPending.value
  );
  const isHeavyLevel = computed(() => level.value === 'DEBUG' || level.value === 'TRACE');

  async function applyLevel() {
    if (!canApply.value || ttl.value === null) return;
    const logger = loggerName.value;
    try {
      const result = await setMutation.mutateAsync({ logger, level: level.value, ttlMinutes: ttl.value });
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: `Ustawiono ${result.level} dla ${result.logger} do ${moment(result.revertsAt).format('HH:mm')}.`,
        life: 4000,
      });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Błąd',
        detail: UtilsService.getApiErrorMessage(error, 'Nie udało się zmienić poziomu logów.'),
        life: 5000,
      });
    }
  }

  const resettingLogger = ref<string | null>(null);
  async function resetLevel(logger: string) {
    resettingLogger.value = logger;
    try {
      await resetMutation.mutateAsync(logger);
      toast.add({ severity: 'success', summary: 'Potwierdzenie', detail: `Przywrócono poziom ${logger}.`, life: 3000 });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Błąd',
        detail: UtilsService.getApiErrorMessage(error, 'Nie udało się przywrócić poziomu.'),
        life: 5000,
      });
    } finally {
      resettingLogger.value = null;
    }
  }
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Stan instancji -->
    <div
      class="flex flex-wrap items-center gap-8 rounded-xl border border-surface-200 bg-surface-0 px-5 py-4 dark:border-surface-700 dark:bg-surface-900"
    >
      <div class="flex flex-col gap-1">
        <span class="text-xs font-medium text-surface-600 dark:text-surface-400">Instancja</span>
        <span class="font-mono text-[15px] font-medium text-surface-900 dark:text-surface-0">
          {{ info?.instance ?? '—' }}
        </span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs font-medium text-surface-600 dark:text-surface-400">Poziom root (tylko odczyt)</span>
        <span class="flex h-[22px] items-center">
          <LogLevelTag v-if="info?.rootLevel" :level="info.rootLevel" />
          <span v-else class="text-surface-600 dark:text-surface-400">—</span>
        </span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs font-medium text-surface-600 dark:text-surface-400">TTL domyślny / maksymalny</span>
        <span class="font-mono text-[15px] text-surface-900 dark:text-surface-0">
          {{ info?.defaultTtlMinutes ?? '—' }} min / {{ info?.maxTtlMinutes ?? '—' }} min
        </span>
      </div>
      <Message severity="secondary" :closable="false" class="ml-auto max-w-xl">
        Zmiana działa tylko na instancji <b class="font-semibold">{{ info?.instance ?? '…' }}</b> i jest tymczasowa: po
        upływie TTL poziom wraca do wartości sprzed zmiany. Restart aplikacji też usuwa wszystkie nadpisania.
      </Message>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
      <!-- Aktywne nadpisania -->
      <section
        class="flex min-w-0 flex-col overflow-hidden rounded-xl border border-surface-200 bg-surface-0 dark:border-surface-700 dark:bg-surface-900"
      >
        <div class="flex items-baseline gap-3 border-b border-surface-200 px-5 py-4 dark:border-surface-700">
          <h2 class="m-0 text-base font-semibold text-surface-900 dark:text-surface-0">Aktywne nadpisania</h2>
          <span class="text-[13px] text-surface-600 dark:text-surface-400">{{ overrides.length }} aktywnych</span>
        </div>

        <DataTable :value="overrides" :loading="query.isFetching.value && !info" data-key="logger" size="small">
          <template #empty>
            <div class="flex flex-col items-center gap-2 py-12 text-center">
              <span class="text-base font-medium text-surface-700 dark:text-surface-200">Brak aktywnych nadpisań</span>
              <span class="max-w-sm text-sm text-surface-600 dark:text-surface-400">
                Wszystkie loggery używają poziomów z konfiguracji. Ustaw tymczasowy poziom w panelu obok.
              </span>
            </div>
          </template>

          <Column field="logger" header="Logger">
            <template #body="{ data }">
              <span class="break-all font-mono text-[13px] text-sky-700 dark:text-sky-300">{{ data.logger }}</span>
            </template>
          </Column>
          <Column field="level" header="Poziom" style="min-width: 6rem">
            <template #body="{ data }"><LogLevelTag :level="data.level" /></template>
          </Column>
          <Column header="Wcześniej" style="min-width: 8rem">
            <template #body="{ data }">
              <span class="font-mono text-xs text-surface-600 dark:text-surface-400">
                {{ data.previousLevel ?? 'dziedziczony' }}
              </span>
            </template>
          </Column>
          <Column field="changedBy" header="Ustawił" style="min-width: 6rem" />
          <Column header="Wraca" style="min-width: 8rem">
            <template #body="{ data }">
              <div class="flex flex-col gap-0.5">
                <span class="font-mono text-[13px] font-medium text-surface-900 dark:text-surface-0">
                  za {{ UtilsService.formatCountdown(remainingMs(data.revertsAt)) }}
                </span>
                <span class="font-mono text-xs text-surface-600 dark:text-surface-400">
                  o {{ moment(data.revertsAt).format('HH:mm') }}
                </span>
              </div>
            </template>
          </Column>
          <Column style="width: 8rem">
            <template #body="{ data }">
              <Button
                type="button"
                label="Przywróć"
                size="small"
                outlined
                severity="secondary"
                :loading="resettingLogger === data.logger"
                :aria-label="`Przywróć poziom loggera ${data.logger}`"
                @click="resetLevel(data.logger)"
              />
            </template>
          </Column>
        </DataTable>
      </section>

      <!-- Formularz -->
      <section
        class="flex flex-col gap-5 rounded-xl border border-surface-200 bg-surface-0 p-5 dark:border-surface-700 dark:bg-surface-900"
      >
        <h2 class="m-0 text-base font-semibold text-surface-900 dark:text-surface-0">Zmień poziom loggera</h2>

        <div class="flex flex-col gap-2">
          <label for="log-prefix" class="text-xs font-medium text-surface-600 dark:text-surface-400">
            Pakiet (dozwolone prefiksy)
          </label>
          <Select
            v-model="prefix"
            input-id="log-prefix"
            :options="info?.allowedLoggers ?? []"
            placeholder="Wybierz prefiks…"
            filter
            class="w-full"
            :pt="{ label: { class: 'font-mono text-[13px]' } }"
          />
          <label for="log-suffix" class="mt-1 text-xs font-medium text-surface-600 dark:text-surface-400">
            Dopisek po kropce (opcjonalnie)
          </label>
          <InputText
            id="log-suffix"
            v-model="suffix"
            placeholder="np. goahead"
            spellcheck="false"
            class="w-full font-mono text-[13px]"
            :invalid="!!suffixError"
          />
          <span v-if="suffixError" class="text-[13px] text-red-600 dark:text-red-400" role="alert">
            {{ suffixError }}
          </span>
          <span class="text-xs text-surface-600 dark:text-surface-400">
            Logger:
            <span class="break-all font-mono text-surface-800 dark:text-surface-200">{{ loggerName || '—' }}</span>
          </span>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-surface-600 dark:text-surface-400">Nowy poziom</span>
          <SelectButton
            v-model="level"
            :options="[...LOG_LEVELS]"
            :allow-empty="false"
            aria-label="Nowy poziom"
            fluid
            :pt="{ pcToggleButton: { root: { class: 'font-mono text-xs' } } }"
          />
          <Message v-if="isHeavyLevel" severity="warn" :closable="false" size="small">
            DEBUG/TRACE zwiększa liczbę logów i może zapisać dane wrażliwe (treści zapytań, SQL). Zmiana wygasa po
            wskazanym czasie i dotyczy tylko instancji: {{ info?.instance ?? '…' }}.
          </Message>
        </div>

        <div class="flex flex-col gap-2">
          <label for="log-ttl" class="text-xs font-medium text-surface-600 dark:text-surface-400">
            Czas trwania (TTL)
          </label>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="shortcut in TTL_SHORTCUTS"
              :key="shortcut.minutes"
              type="button"
              :label="shortcut.label"
              size="small"
              :outlined="ttl !== shortcut.minutes"
              :severity="ttl === shortcut.minutes ? undefined : 'secondary'"
              :disabled="shortcut.minutes > maxTtl"
              :aria-pressed="ttl === shortcut.minutes"
              @click="ttl = shortcut.minutes"
            />
          </div>
          <div class="flex items-center gap-2.5">
            <InputNumber
              v-model="ttl"
              input-id="log-ttl"
              :min="1"
              :max="maxTtl"
              :use-grouping="false"
              show-buttons
              :invalid="ttl !== null && !ttlValid"
              input-class="w-24 font-mono text-[13px]"
            />
            <span class="text-[13px] text-surface-600 dark:text-surface-400">minut · dozwolone 1–{{ maxTtl }}</span>
          </div>
          <span v-if="!ttlValid" class="text-[13px] text-red-600 dark:text-red-400" role="alert">
            Podaj liczbę minut z zakresu 1–{{ maxTtl }}.
          </span>
        </div>

        <Button
          type="button"
          label="Ustaw poziom"
          :disabled="!canApply"
          :loading="setMutation.isPending.value"
          @click="applyLevel"
        />
        <span class="text-xs leading-relaxed text-surface-600 dark:text-surface-400">
          Ponowne ustawienie tego samego loggera zastąpi poziom i przedłuży TTL, ale powrót nadal nastąpi do poziomu
          sprzed pierwszej zmiany.
        </span>
      </section>
    </div>
  </div>
</template>
