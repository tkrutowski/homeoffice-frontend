export const LOG_LEVELS = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

/** Instancje znane z backendu; lista nie jest zamknięta (może ich przybyć), stąd `string` w typach. */
export const KNOWN_INSTANCES = ['ec2', 'synology', 'local', 'unknown'] as const;

export interface Log {
  /** Klucz tylko po stronie frontendu (backend go nie zwraca) - `dataKey` tabeli i rozwijanie wierszy. */
  id: number;
  timestamp: Date;
  level: LogLevel;
  thread: string;
  logger: string;
  /** Może być wieloliniowy (stacktrace). */
  message: string;
  instance: string | null;
}

/** Wiersz tabeli: wpis logu albo separator „Utracono część logów” (tylko podgląd na żywo). */
export interface LogRow extends Log {
  gap?: boolean;
}

export interface LogsResult {
  logs: Log[];
  /** true = wpisów było więcej niż `limit`; zwrócono najwcześniejsze. */
  truncated: boolean;
}

export interface LogsRangeParams {
  /** yyyy-MM-ddTHH:mm:ss, włącznie */
  from: string;
  /** yyyy-MM-ddTHH:mm:ss, wyłącznie */
  to: string;
  /** Pusta lista = wszystkie poziomy. */
  levels: LogLevel[];
  limit: number;
  /** null = wszystkie instancje. */
  instance: string | null;
}

export interface LiveLogsParams {
  /** Brak = pierwsze zapytanie sesji (ostatnie wpisy + kursor). */
  after: number | null;
  /** Pusta lista = wszystkie poziomy. */
  levels: LogLevel[];
  limit?: number;
}

export interface LiveLogsResult {
  instance: string;
  logs: Log[];
  cursor: number;
  /** Część wpisów przepadła (bufor się przewinął albo restart backendu). */
  gap: boolean;
  /** Jest więcej nowych wpisów niż limit - odpytaj ponownie od razu. */
  hasMore: boolean;
}

export interface LogLevelOverride {
  logger: string;
  level: LogLevel;
  /** null = logger dziedziczył poziom. */
  previousLevel: LogLevel | null;
  setAt: Date;
  revertsAt: Date;
  changedBy: string;
}

export interface LogLevelsInfo {
  instance: string;
  rootLevel: LogLevel | null;
  /** Dozwolone PREFIKSY loggerów. */
  allowedLoggers: string[];
  defaultTtlMinutes: number;
  maxTtlMinutes: number;
  overrides: LogLevelOverride[];
}

/** Logger istniejący na instancji (pakiet albo klasa), z endpointu `/v1/logs/levels/loggers`. */
export interface LoggerInfo {
  /** Pełna nazwa, np. `net.focik.homeoffice.goahead.domain.invoice.KsefService`. */
  name: string;
  /** null = logger dziedziczy poziom po nadrzędnym. */
  configuredLevel: LogLevel | null;
  /** Poziom, który faktycznie obowiązuje. */
  effectiveLevel: LogLevel | null;
}

export interface SetLogLevelRequest {
  logger: string;
  level: LogLevel;
  ttlMinutes?: number;
}

export const HISTORY_LIMITS = [500, 1000, 2000, 5000] as const;
export const DEFAULT_HISTORY_LIMIT = 1000;
/** Maksymalny zakres zapytania o historię (limit backendu). */
export const MAX_RANGE_DAYS = 7;
