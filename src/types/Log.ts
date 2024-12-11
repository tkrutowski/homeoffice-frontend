type LogLevel = 'INFO' | 'DEBUG' | 'ERROR' | 'WARN'

export interface Log {
  timestamp: Date
  level: LogLevel
  processId: number
  thread: string
  logger: string
  message: string
}
