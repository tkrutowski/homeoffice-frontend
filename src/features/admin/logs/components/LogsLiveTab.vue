<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import LogLevelFilter from '@/features/admin/logs/components/LogLevelFilter.vue';
  import LogsTable from '@/features/admin/logs/components/LogsTable.vue';
  import { useLiveLogs, type LiveLogsStatus } from '@/features/admin/logs/composables/useLiveLogs';
  import { LOG_LEVELS, type LogLevel } from '@/features/admin/logs/types';

  const selectedLevels = ref<LogLevel[]>([...LOG_LEVELS]);
  const { entries, status, instance, cursor, start, pause, clear } = useLiveLogs(selectedLevels);

  const isPaused = computed(() => status.value === 'paused');

  const STATUS_VIEW: Record<LiveLogsStatus, { label: string; dot: string; text: string }> = {
    idle: {
      label: 'Uruchamianie…',
      dot: 'bg-surface-400',
      text: 'text-surface-600 dark:text-surface-400',
    },
    running: {
      label: 'Połączono — nasłuchiwanie nowych wpisów',
      dot: 'bg-green-600 dark:bg-green-400',
      text: 'text-green-700 dark:text-green-400',
    },
    paused: {
      label: 'Wstrzymano — nowe wpisy nie są pobierane',
      dot: 'bg-amber-500 dark:bg-amber-400',
      text: 'text-amber-700 dark:text-amber-400',
    },
    offline: {
      label: 'Brak połączenia — ponawiam',
      dot: 'bg-red-600 dark:bg-red-400',
      text: 'text-red-700 dark:text-red-400',
    },
  };
  const statusView = computed(() => STATUS_VIEW[status.value]);

  const levelCounts = computed(() => {
    const counts: Partial<Record<LogLevel, number>> = {};
    for (const entry of entries.value) {
      if (!entry.gap) counts[entry.level] = (counts[entry.level] ?? 0) + 1;
    }
    return counts;
  });

  // Auto-przewijanie: wyłącza się, gdy użytkownik przewinie w górę; wraca, gdy zjedzie na dół.
  const autoScroll = ref(true);
  const tableRef = ref<InstanceType<typeof LogsTable> | null>(null);
  let scrollEl: HTMLElement | null = null;

  const scrollToBottom = () => {
    if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
  };
  const onScroll = () => {
    if (!scrollEl) return;
    autoScroll.value = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 40;
  };

  watch(entries, async () => {
    if (!autoScroll.value) return;
    await nextTick();
    scrollToBottom();
  });
  watch(autoScroll, enabled => {
    if (enabled) scrollToBottom();
  });

  onMounted(async () => {
    await nextTick();
    scrollEl = tableRef.value?.getScrollContainer() ?? null;
    scrollEl?.addEventListener('scroll', onScroll, { passive: true });
    start();
  });
  onBeforeUnmount(() => scrollEl?.removeEventListener('scroll', onScroll));

  const togglePause = () => (isPaused.value ? start() : pause());
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      class="flex flex-col gap-4 rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-700 dark:bg-surface-900"
    >
      <div class="flex flex-wrap items-center gap-4">
        <Button
          type="button"
          :icon="isPaused ? 'pi pi-play' : 'pi pi-pause'"
          :label="isPaused ? 'Wznów' : 'Wstrzymaj'"
          :severity="isPaused ? undefined : 'secondary'"
          :outlined="!isPaused"
          @click="togglePause"
        />
        <div class="flex flex-col gap-0.5 text-[13px]">
          <span class="flex items-center gap-2 font-medium" :class="statusView.text">
            <span class="h-2 w-2 rounded-full" :class="statusView.dot" />
            {{ statusView.label }}
          </span>
          <span class="font-mono text-xs text-surface-600 dark:text-surface-400">
            kursor {{ cursor ?? '—' }} · odpytywanie co 1,5 s
          </span>
        </div>
        <Message severity="secondary" :closable="false" class="ml-auto max-w-xl">
          Podgląd dotyczy wyłącznie instancji
          <b class="font-semibold">{{ instance ?? '…' }}</b>
          , z którą łączy się aplikacja. Historię innych instancji znajdziesz w zakładce Historia.
        </Message>
      </div>

      <LogLevelFilter v-model="selectedLevels" :counts="levelCounts" />
    </div>

    <LogsTable
      ref="tableRef"
      :rows="entries"
      scroll-height="65vh"
      :show-date="false"
      empty-title="Czekam na nowe wpisy…"
      empty-hint="Nowe logi pojawią się tutaj automatycznie."
    >
      <template #header-actions>
        <Button
          type="button"
          icon="pi pi-trash"
          label="Wyczyść"
          text
          severity="secondary"
          size="small"
          @click="clear"
        />
        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="autoScroll" input-id="logs-autoscroll" />
          <label for="logs-autoscroll" class="cursor-pointer">Auto-przewijanie</label>
        </div>
      </template>
    </LogsTable>
  </div>
</template>
