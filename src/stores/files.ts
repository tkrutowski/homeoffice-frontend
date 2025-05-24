import {defineStore} from 'pinia'
import httpCommon from '@/config/http-common'
import type {Module} from "@/types/FileInfo.ts";

export const useFilesStore = defineStore('file', {
    state: () => ({
        loadingLogs: false,
    }),

    //getters = computed
    getters: {
        // getLogs: (state) =>
        //     state.logs
        //         .slice() // Tworzymy kopię tablicy, aby uniknąć mutacji oryginalnej tablicy
        //         .sort((a: Log, b: Log) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), // Sortowanie od najnowszych
        // getLogLevels: (state) => Array.from(new Set(state.logs.map((log: Log) => log.level))),
    },

    //actions = metody w komponentach
    actions: {
        //
        // ADD DEVICE FILE
        //
        async addFileDb(module: Module, formData: FormData) {
            console.log('START - addFileDb()', module, formData)

            const response = await httpCommon.post(`/v1/files/${module}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            console.log('END - addDeviceFileDb()', response.data)
            return response.data;
        },
        //
        //DELETE FILE
        //
        async deleteFileDb(module: Module, fileName: string) {
            console.log('START - deleteFileDb()', module, fileName)
            const response = await httpCommon.delete(`/v1/files/${module}/${fileName}`);


            console.log('END - deleteFileDb()')
            return response;
        },
        //
        //DOWNLOAD FILE
        //
        async downloadFileDb(module: Module, fileName: string) {
            console.log('START - downloadFileDb()', module, fileName)
            const response = await httpCommon.get(`/v1/files/${module}/${fileName}`, {
                responseType: 'blob'
            });
            
            console.log('END - downloadFileDb()')
            return response.data;
        }

    },
})
