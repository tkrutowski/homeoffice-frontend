import { defineStore } from 'pinia';
import httpCommon from '@/config/http-common';
import type { Module } from '@/types/FileInfo.ts';

export const useFilesStore = defineStore('file', {
  state: () => ({}),

  //actions = metody w komponentach
  actions: {
    //
    // ADD DEVICE FILE
    //
    async addFileDb(module: Module, formData: FormData) {
      console.log('START - addFileDb()', module, formData);

      const response = await httpCommon.post(`/v1/files/${module}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('END - addDeviceFileDb()', response.data);
      return response.data;
    },
    //
    //DELETE FILE
    //
    async deleteFileDb(module: Module, fileName: string) {
      console.log('START - deleteFileDb()', module, fileName);
      const response = await httpCommon.delete(`/v1/files/${module}/${fileName}`);

      console.log('END - deleteFileDb()');
      return response;
    },
    //
    //DOWNLOAD FILE
    //
    async downloadFileDb(module: Module, fileName: string) {
      console.log('START - downloadFileDb()', module, fileName);
      const response = await httpCommon.get(`/v1/files/${module}/${fileName}`, {
        responseType: 'blob',
      });

      console.log('END - downloadFileDb()');
      return response.data;
    },
  },
});
