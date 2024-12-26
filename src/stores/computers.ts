import {defineStore} from 'pinia'
import httpCommon from '../config/http-common'
import type {ActiveStatus} from '../types/Bank.ts'
import type {Computer} from "../types/Computer.ts";

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
    },

    //actions = metody w komponentach
    actions: {
        //
        //REFRESH BOOKS
        //
        async refreshComputers() {
            this.computers = await this.getComputersFromDB()
        },
        //
        //GET COMPUTERS
        //
        async getComputers() {
            console.log('START - getComputers()')
            if (this.computers.length === 0 && !this.loadingComputers) {
                // await this.refreshComputers()
                this.computers.push({
                    name: 'Desktop-Tomek',
                    activeStatus: 'ACTIVE',
                    case: 105,
                    cooling: [132],
                    power: 137,
                    disk: [109,133],
                    monitor: [97,120],
                    id:1,
                    keyboard:-1,
                    mainBoard:131,
                    mouse:-1,
                    ram:[130],
                    otherInfo:'INFO',
                    processor:129,
                    soundCard:-1,
                    graphicCard: [103],
                    usb: []
                })
                this.computers.push({
                    name: 'Desktop-Stasiu',
                    activeStatus: 'ACTIVE',
                    case: -1,
                    cooling: [-1],
                    power: 137,
                    disk: [],
                    monitor: [134],
                    id:1,
                    keyboard:-1,
                    mainBoard:-1,
                    mouse:-1,
                    ram:[],
                    otherInfo:'INFO',
                    processor:-1,
                    soundCard:-1,
                    graphicCard: [],
                    usb: []
                })
            }
            console.log('END - getComputers()')

            return this.computers
        },
        //-------------------------------------------------------DATABASE
        //
        //GET COMPUTERS FROM DB
        //
        async getComputersFromDB(): Promise<Computer[]> {
            console.log('START - getComputersFromDB()')
            this.loadingComputers = true

            const response = await httpCommon.get(`/v1/computer`)
            console.log('getComputersFromDB() - Ilosc[]: ' + response.data.length)
            this.loadingComputers = false
            console.log('END - getComputersFromDB()')
            return response.data
        },
        //
        //GET  DEVICE FROM DB BY ID
        //
        async getComputerFromDb(computerId: number): Promise<Computer | null> {
            console.log('START - getComputerFromDb(' + computerId + ')')
            this.loadingComputers = true

            const response = await httpCommon.get(`/v1/computer/` + computerId)
            this.loadingComputers = false
            console.log('END - getComputerFromDb()')
            if (response.data)
                return response.data
            else
                return null
        },
        //
        //DELETE COMPUTER
        //
        async deleteComputerDb(computerId: number) {
            console.log('START - deleteComputerDb()')
            await httpCommon.delete(`/v1/devices/` + computerId)
            const index = this.computers.findIndex((comp: Computer) => comp.id === computerId)
            if (index !== -1) this.computers.splice(index, 1)
            console.log('END - deleteComputerDb()')
        },

        //ADD COMPUTER
        //
        async addComputerDb(computer: Computer) {
            console.log('START - addComputerDb()')
            const response = await httpCommon.post(`/v1/computer`, computer)
            this.computers.push(response.data)
            console.log('END - addComputerDb()')
        },

        //
        //UPDATE COMPUTER
        //down
        async updateComputerDb(computer: Computer) {
            console.log('START - updateComputerDb()')
            const response = await httpCommon.put(`/v1/computer`, computer)
            const index = this.computers.findIndex((comp: Computer) => comp.id === computer.id)
            if (index !== -1) this.computers.splice(index, 1, response.data)
            console.log('END - updateComputerDb()')
        },

        //
        //CHANGE ACTIVE STATUS
        //
        async updateStatusDb(computerId: number, status: ActiveStatus) {
            console.log('START - updateStatusDb()')
            await httpCommon.put(`/v1/computer/status/${computerId}?status=${status}`)
            const device = this.computers.find((comp: Computer) => comp.id === computerId)
            if (device) {
                device.activeStatus = status
            }
            console.log('END - updateStatusDb()')
        },
    },
})
