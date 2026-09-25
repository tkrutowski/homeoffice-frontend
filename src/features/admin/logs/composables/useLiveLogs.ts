import axios from 'axios';
import { onScopeDispose, ref, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { fetchLiveLogs } from '@/features/admin/logs/api/liveLogsApi';
import { LOG_LEVELS, type LiveLogsResult, type LogLevel, type LogRow } from '@/features/admin/logs/types';

export type LiveLogsStatus = 'idle' | 'running' | 'paused' | 'offline';

const POLL_INTERVAL_MS = 1500;
/** Narastające opóźnienie po błędzie sieci / 5xx; ostatnia wartość to sufit. */
const BACKOFF_MS = [1500, 3000, 6000, 15000];
/** Ile ostatnich wpisów trzymamy w przeglądarce (starsze są obcinane). */
export const LIVE_MAX_ENTRIES = 5000;

let nextGapId = -1;

function createGapRow(): LogRow {
  return {
    id: nextGapId--,
    timestamp: new Date(),
    level: 'WARN',
    thread: '',
    logger: '',
    message: 'Utracono część logów (restart aplikacji lub przepełniony bufor)',
    instance: null,
    gap: true,
  };
}

/**
 * Podgląd logów na żywo: polling z kursorem (`after`) oparty na `setTimeout` (nie `setInterval`, żeby odpowiedzi
 * nie nakładały się na siebie). Nie nadaje się do `useQuery` - stan kursora i akumulacji wpisów jest po stronie klienta.
 *
 * - `hasMore` → następne zapytanie od razu, w przeciwnym razie co 1,5 s
 * - karta ukryta → odpytywanie wstrzymane (wznawiane po powrocie); odmontowanie → koniec pętli
 * - zmiana filtra poziomów = nowa sesja (czyścimy listę i zaczynamy bez `after`)
 * - pauza zachowuje kursor; jeśli wpisy przepadły w międzyczasie, backend zwróci `gap`
 */
export function useLiveLogs(levels: MaybeRefOrGetter<LogLevel[]>) {
  const entries = shallowRef<LogRow[]>([]);
  const status = ref<LiveLogsStatus>('idle');
  const instance = ref<string | null>(null);
  const cursor = ref<number | null>(null);

  let wanted = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let controller: AbortController | null = null;
  let session = 0;
  let failures = 0;

  /** Wszystkie poziomy = brak parametru `levels`. */
  const levelsParam = (): LogLevel[] => {
    const current = toValue(levels);
    return current.length === LOG_LEVELS.length ? [] : current;
  };

  function stopPolling() {
    if (timer) clearTimeout(timer);
    timer = null;
    controller?.abort();
    controller = null;
  }

  function schedule(delayMs: number) {
    if (!wanted || document.hidden) return;
    timer = setTimeout(poll, delayMs);
  }

  function append(result: LiveLogsResult) {
    if (result.logs.length === 0 && !result.gap) return;
    const next = [...entries.value];
    if (result.gap && next.length > 0) next.push(createGapRow());
    next.push(...result.logs);
    entries.value = next.length > LIVE_MAX_ENTRIES ? next.slice(-LIVE_MAX_ENTRIES) : next;
  }

  async function poll() {
    timer = null;
    const mySession = session;
    controller = new AbortController();
    try {
      const result = await fetchLiveLogs({ after: cursor.value, levels: levelsParam() }, controller.signal);
      if (mySession !== session) return;
      failures = 0;
      status.value = 'running';
      instance.value = result.instance;
      cursor.value = result.cursor;
      append(result);
      schedule(result.hasMore ? 0 : POLL_INTERVAL_MS);
    } catch (error) {
      // anulowane (pauza / ukryta karta / nowa sesja) - stan zmienił kto anulował
      if (mySession !== session || axios.isCancel(error)) return;
      failures++;
      status.value = 'offline';
      schedule(BACKOFF_MS[Math.min(failures - 1, BACKOFF_MS.length - 1)]);
    }
  }

  function start() {
    wanted = true;
    failures = 0;
    status.value = 'running';
    stopPolling();
    if (!document.hidden) poll();
  }

  function pause() {
    wanted = false;
    stopPolling();
    status.value = 'paused';
  }

  function clear() {
    entries.value = [];
  }

  function restartSession() {
    session++;
    stopPolling();
    entries.value = [];
    cursor.value = null;
    failures = 0;
    if (wanted && !document.hidden) poll();
  }

  function onVisibilityChange() {
    if (!wanted) return;
    if (document.hidden) {
      stopPolling();
    } else {
      stopPolling();
      poll();
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  watch(() => [...toValue(levels)], restartSession);

  onScopeDispose(() => {
    wanted = false;
    stopPolling();
    document.removeEventListener('visibilitychange', onVisibilityChange);
  });

  return { entries, status, instance, cursor, start, pause, clear };
}
