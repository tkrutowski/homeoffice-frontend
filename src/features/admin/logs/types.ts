export const LOG_LEVELS = ['INFO', 'DEBUG', 'WARN', 'ERROR'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export interface Log {
  timestamp: Date;
  level: LogLevel;
  processId: number;
  thread: string;
  logger: string;
  message: string;
}

export interface LogsRangeParams {
  /** YYYY-MM-DD */
  from: string;
  /** YYYY-MM-DD */
  to: string;
  levels: LogLevel[];
}
