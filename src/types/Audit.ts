import type { AuditAction, AuditChangeEntry, AuditEntityType } from '@/types/DeviceDashboard';

/** Odpowiedź GET /v1/audit (AuditEntryDto z backendu). */
export interface AuditEntryDto {
  id: number;
  entityType: string;
  entityId?: number;
  action: string;
  changedAt?: string | Date;
  changedBy?: string;
  /** Snapshot encji po zmianie (Device / Computer jako JSON). */
  newValues?: string | Record<string, unknown> | null;
  /** Snapshot przed zmianą (np. przy DELETE). */
  oldValues?: string | Record<string, unknown> | null;
}

function parseAuditAction(value: string): AuditAction {
  const upper = value?.toUpperCase() ?? '';
  if (upper === 'CREATE' || upper === 'INSERT') return 'CREATE';
  if (upper === 'DELETE' || upper === 'REMOVE') return 'DELETE';
  return 'UPDATE';
}

function parseAuditEntityType(value: string): AuditEntityType {
  return value?.toUpperCase() === 'COMPUTER' ? 'COMPUTER' : 'DEVICE';
}

function parseAuditTimestamp(dto: AuditEntryDto): Date {
  const raw = dto.changedAt;
  if (!raw) return new Date(0);
  const date = raw instanceof Date ? raw : new Date(raw);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function parseAuditJson(raw: string | Record<string, unknown> | null | undefined): Record<string, unknown> | null {
  if (raw == null) return null;
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
}

/** Nazwa z serializowanego Device / Computer (pole `name`). */
export function extractEntityNameFromAuditPayload(dto: AuditEntryDto): string {
  const payload = parseAuditJson(dto.newValues) ?? parseAuditJson(dto.oldValues);

  if (!payload) {
    if (dto.entityId != null) return `#${dto.entityId}`;
    return '—';
  }

  const name = payload.name;
  if (typeof name === 'string' && name.trim()) {
    return name.trim();
  }

  if (typeof payload.id === 'number') {
    return `#${payload.id}`;
  }

  return '—';
}

export function mapAuditEntryDtoToChangeEntry(dto: AuditEntryDto): AuditChangeEntry {
  return {
    id: dto.id,
    action: parseAuditAction(dto.action),
    entityType: parseAuditEntityType(dto.entityType),
    entityName: extractEntityNameFromAuditPayload(dto),
    timestamp: parseAuditTimestamp(dto),
    user: dto.changedBy,
  };
}
