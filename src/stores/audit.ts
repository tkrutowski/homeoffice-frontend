import { defineStore } from 'pinia';
import httpCommon from '@/config/http-common';
import type { AuditChangeEntry } from '@/types/DeviceDashboard';
import type { AuditEntityType } from '@/types/DeviceDashboard';
import { mapAuditEntryDtoToChangeEntry, type AuditEntryDto } from '@/types/Audit';

export const useAuditStore = defineStore('audit', {
  state: () => ({
    loadingAudit: false,
    recentChanges: [] as AuditChangeEntry[],
  }),

  actions: {
    async getLatestEntries(entityType: AuditEntityType, limit: number): Promise<AuditChangeEntry[]> {
      const response = await httpCommon.get<AuditEntryDto[]>(`/v1/audit`, {
        params: { entityType, limit },
      });
      return (response.data ?? []).map(mapAuditEntryDtoToChangeEntry);
    },

    /**
     * Ostatnie zmiany dla tablicy urządzeń: DEVICE + COMPUTER, posortowane malejąco po czasie.
     */
    async fetchDashboardRecentChanges(limit: number): Promise<AuditChangeEntry[]> {
      console.log('START - fetchDashboardRecentChanges()', limit);
      this.loadingAudit = true;

      try {
        const perTypeLimit = limit;
        const [deviceEntries, computerEntries] = await Promise.all([
          this.getLatestEntries('DEVICE', perTypeLimit),
          this.getLatestEntries('COMPUTER', perTypeLimit),
        ]);

        this.recentChanges = [...deviceEntries, ...computerEntries]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);

        console.log('END - fetchDashboardRecentChanges()', this.recentChanges.length);
        return this.recentChanges;
      } finally {
        this.loadingAudit = false;
      }
    },
  },
});
