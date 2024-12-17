import {defineStore} from 'pinia'
import httpCommon from '../config/http-common'
import type {Log} from '../types/Log.ts'

export const useLogsStore = defineStore('log', {
    state: () => ({
        loadingLogs: false,
        rowsPerPage: parseInt(localStorage.getItem('rowsPerPageLogs') || '20', 10),
        logs: [] as Log[],
    }),

    //getters = computed
    getters: {
        getLogs: (state) =>
            state.logs
                .slice() // Tworzymy kopię tablicy, aby uniknąć mutacji oryginalnej tablicy
                .sort((a: Log, b: Log) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), // Sortowanie od najnowszych
        getLogLevels: (state) => Array.from(new Set(state.logs.map((log: Log) => log.level))),
    },

    //actions = metody w komponentach
    actions: {
        //
        //GET TODAY'S LOGS
        //
        async getTodayLogsFromDb(): Promise<void> {
            console.log('START - getTodayLogsFromDb()')
            this.loadingLogs = true

            const response = await httpCommon.get(`/v1/logs`)
            console.log('getTodayLogsFromDb() - Ilosc[]: ' + response.data.length)
            this.logs = response.data
            this.loadingLogs = false
            console.log('END - getTodayLogsFromDb()')
        },
        //
        //GET LOGS BY DATE AND LEVEL
        //
        async getLogsFromDb(dateFrom: string, dateTo: string, level: string): Promise<void> {
            console.log(`START - getLogsFromDb(${dateFrom}, ${dateTo}, ${level})`)
            this.loadingLogs = true

            const response = await httpCommon.get(
                `/v1/logs/date?from=${dateFrom}T00:00:00&to=${dateTo}T00:00:00&levels=${level}`,
            )
            console.log('getLogsFromDb() - Ilosc[]: ' + response.data.length)
            this.logs = response.data
            this.loadingLogs = false
            console.log('END - getLogsFromDb()')
        },
    },
})
