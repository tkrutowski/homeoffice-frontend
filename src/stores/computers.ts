import { defineStore } from 'pinia';
import httpCommon from '@/config/http-common';
import type { ActiveStatus } from '@/types/Bank.ts';
import type { ComponentType, Computer } from '@/types/Computer.ts';

export const useComputerStore = defineStore('computer', {
  state: () => ({
    loadingComputers: false,
    computers: [] as Computer[],
  }),

  //getters = computed
  getters: {
    // getSortedSeries: (state) =>
    //     state.series.filter(serie => serie.id != 2)
    //         .sort((a, b) => a.title.localeCompare(b.title)),
    componentTypes: () => {
      let components: ComponentType[] = [];
      components.push({
        name: 'COMPUTER_CASE',
        max: 1,
        viewName: 'Obudowa',
        column: 'computerCase',
      });
      components.push({
        name: 'PROCESSOR',
        max: 1,
        viewName: 'Procesor',
        column: 'processor',
      });
      components.push({
        name: 'MOTHERBOARD',
        max: 1,
        viewName: 'Płyta główna',
        column: 'motherboard',
      });
      components.push({
        name: 'RAM',
        max: 4,
        viewName: 'Pamięć RAM',
        column: 'ram',
      });
      components.push({
        name: 'GRAPHICS_CARD',
        max: 2,
        viewName: 'Karta graficzna',
        column: 'graphicCard',
      });
      components.push({
        name: 'POWER',
        max: 1,
        viewName: 'Zasilacz',
        column: 'power',
      });
      components.push({
        name: 'DISK',
        max: 10,
        viewName: 'Dysk',
        column: 'disk',
      });
      components.push({
        name: 'COOLER',
        max: 10,
        viewName: 'Chłodzenie',
        column: 'cooling',
      });
      components.push({
        name: 'SOUND_CARD',
        max: 1,
        viewName: 'Karta muzyczna',
        column: 'soundCard',
      });
      components.push({
        name: 'KEYBOARD',
        max: 1,
        viewName: 'Klawiatura',
        column: 'keyboard',
      });
      components.push({
        name: 'MOUSE',
        max: 1,
        viewName: 'Mysz',
        column: 'mouse',
      });
      components.push({
        name: 'USB',
        max: 20,
        viewName: 'Urządzenia USB',
        column: 'usb',
      });
      components.push({
        name: 'DISPLAY',
        max: 4,
        viewName: 'Monitor',
        column: 'display',
      });
      return components;
    },
  },

  //actions = metody w komponentach
  actions: {
    //
    //REFRESH BOOKS
    //
    async refreshComputers() {
      this.computers = await this.getComputersFromDB();
    },
    //
    //GET COMPUTERS
    //
    async getComputers() {
      console.log('START - getComputers()');
      if (this.computers.length === 0 && !this.loadingComputers) {
        this.loadingComputers = true;
        await this.refreshComputers();
      }
      console.log('END - getComputers()');
      this.loadingComputers = false;
      return this.computers;
    },
    //-------------------------------------------------------DATABASE
    //
    //GET COMPUTERS FROM DB
    //
    async getComputersFromDB(): Promise<Computer[]> {
      console.log('START - getComputersFromDB()');
      this.loadingComputers = true;

      const response = await httpCommon.get(`/v1/computer`);
      console.log('getComputersFromDB() - Ilosc[]: ' + response.data.length);
      this.loadingComputers = false;
      console.log('END - getComputersFromDB()');
      return response.data;
    },
    //
    //GET  DEVICE FROM DB BY ID
    //
    async getComputerFromDb(computerId: number): Promise<Computer | null> {
      console.log('START - getComputerFromDb(' + computerId + ')');
      this.loadingComputers = true;

      const response = await httpCommon.get(`/v1/computer/` + computerId);
      this.loadingComputers = false;
      console.log('END - getComputerFromDb()');
      if (response.data) return response.data;
      else return null;
    },
    //
    //DELETE COMPUTER
    //
    async deleteComputerDb(computerId: number) {
      console.log('START - deleteComputerDb()');
      await httpCommon.delete(`/v1/computer/` + computerId);
      const index = this.computers.findIndex((comp: Computer) => comp.id === computerId);
      if (index !== -1) this.computers.splice(index, 1);
      console.log('END - deleteComputerDb()');
    },

    //ADD COMPUTER
    //
    async addComputerDb(computer: Computer) {
      console.log('START - addComputerDb()', computer);
      const response = await httpCommon.post(`/v1/computer`, computer);
      this.computers.push(response.data);
      console.log('END - addComputerDb()');
    },

    //
    //UPDATE COMPUTER
    //down
    async updateComputerDb(computer: Computer) {
      console.log('START - updateComputerDb()');
      const response = await httpCommon.put(`/v1/computer`, computer);
      const index = this.computers.findIndex((comp: Computer) => comp.id === computer.id);
      if (index !== -1) this.computers.splice(index, 1, response.data);
      console.log('END - updateComputerDb()');
    },

    //
    //CHANGE ACTIVE STATUS
    //
    async updateStatusDb(computerId: number, status: ActiveStatus) {
      console.log('START - updateStatusDb()');
      await httpCommon.put(`/v1/computer/status/${computerId}?status=${status}`);
      const device = this.computers.find((comp: Computer) => comp.id === computerId);
      if (device) {
        device.activeStatus = status;
      }
      console.log('END - updateStatusDb()');
    },
  },
});
