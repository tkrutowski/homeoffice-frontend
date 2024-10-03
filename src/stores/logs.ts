import { defineStore } from "pinia";
import httpCommon from "@/http-common";
import { ErrorService } from "@/service/ErrorService";
import {Log} from "@/types/Log.ts";

export const useLogsStore = defineStore("log", {
  state: () => ({
    loadingLogs: false,
    rowsPerPage: parseInt(localStorage.getItem("rowsPerPageLogs") || "20", 10),
    logs: [] as Log[],
  }),

  //getters = computed
  getters: {
    getLogs: (state) =>
      state.logs
          .slice() // Tworzymy kopię tablicy, aby uniknąć mutacji oryginalnej tablicy
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sortowanie od najnowszych
    ,
    getLogLevels: (state) =>
     Array.from(new Set(state.logs.map(log => log.level))),
  },

  //actions = metody w komponentach
  actions: {
    //
    //GET TODAY'S LOGS
    //
    async getTodayLogsFromDb(): Promise<void> {
      console.log("START - getTodayLogsFromDb()");
      this.loadingLogs = true;

      try {
          const response = await httpCommon.get(`/v1/logs`);
          console.log("getTodayLogsFromDb() - Ilosc[]: " + response.data.length);
          this.logs = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getTodayLogsFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingLogs = false;
        console.log("END - getTodayLogsFromDb()");
      }
    },
    //
    //GET LOGS BY DATE AND LEVEL
    //
    async getLogsFromDb(dateFrom:string, dateTo:string, level: string): Promise<void> {
      console.log(`START - getLogsFromDb(${dateFrom}, ${dateTo}, ${level})`);
      this.loadingLogs = true;

      try {
        const response = await httpCommon.get(`/v1/logs/date?from=${dateFrom}T00:00:00&to=${dateTo}T00:00:00&levels=${level}`);
        console.log("getLogsFromDb() - Ilosc[]: " + response.data.length);
        this.logs = response.data;
      } catch (e) {
        if (ErrorService.isAxiosError(e)) {
          console.log("ERROR getLogsFromDb(): ", e);
          ErrorService.validateError(e);
        } else {
          console.log("An unexpected error occurred: ", e);
        }
      } finally {
        this.loadingLogs = false;
        console.log("END - getLogsFromDb()");
      }
    },
  },
});
