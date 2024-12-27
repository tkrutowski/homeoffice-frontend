import {defineStore} from 'pinia'
//import httpCommon from '../config/http-common'
import type {Room} from "../types/Room.ts";

export const useRoomStore = defineStore('room', {
    state: () => ({
        loadingRooms: false,
        rooms: [] as Room[],
    }),

    //getters = computed
    getters: {
        // getSortedSeries: (state) =>
        //     state.series.filter(serie => serie.id != 2)
        //         .sort((a, b) => a.title.localeCompare(b.title)),
        // getDevicesDtos: (state) => {
        //     const devices: Device[] = JSON.parse(JSON.stringify(state.devices))
        //     return devices.map((dev) => {
        //         const dto: DeviceDto = {
        //             id: dev.id,
        //             deviceType: dev.deviceType?.name,
        //             firm: dev.firm!.name,
        //             name: dev.name,
        //             purchaseDate: dev.purchaseDate,
        //             purchaseAmount: dev.purchaseAmount,
        //             sellDate: dev.sellDate,
        //             sellAmount: dev.sellAmount,
        //             warrantyEndDate: dev.warrantyEndDate,
        //             insuranceEndDate: dev.insuranceEndDate,
        //             otherInfo: dev.otherInfo,
        //             activeStatus: dev.activeStatus,
        //         }
        //         return dto
        //     })
        // },
    },

    //actions = metody w komponentach
    actions: {
        //
        //REFRESH BOOKS
        //
        // async refreshDevices() {
        //     this.devices = await this.getDevicesFromDB()
        // },
        //
        //GET DEVICES
        //
         getRooms() {
            console.log('START - getRooms()')
            // if (this.devices.length === 0 && !this.loadingDevices) {
                // await this.getBooksFromDb()
            // }

            this.rooms.push({
                name:'Niebieski',
                bed:['SINGLE', 'SINGLE','SINGLE',"SINGLE"],
                price:800,
                id:1,
                description:'niebieski',
                color:'#0066ff'
            },
                {
                    name:'Czerwony',
                    bed:['SINGLE', 'SINGLE','SINGLE',"DOUBLE"],
                    price:800,
                    id:2,
                    description:'czerwony',
                    color:'#ff0000'
                })
            console.log('END - getRooms()')

            return this.rooms
        },
        //-------------------------------------------------------DATABASE
        //
        //GET DEVICES FROM DB
        //
        // async getDevicesFromDB(): Promise<Device[]> {
        //     console.log('START - getDevicesFromDB()')
        //     this.loadingRooms = true
        //
        //     const response = await httpCommon.get(`/v1/devices`)
        //     console.log('getDevices() - Ilosc[]: ' + response.data.length)
        //     this.loadingRooms = false
        //     console.log('END - getDevicesFromDB()')
        //     return response.data
        // },
        //
        //GET  DEVICE FROM DB BY ID
        //
        // async getDeviceFromDb(deviceId: number): Promise<Device | null> {
        //     console.log('START - getDeviceFromDb(' + deviceId + ')')
        //     this.loadingRooms = true
        //
        //     const response = await httpCommon.get(`/v1/devices/` + deviceId)
        //     this.loadingRooms = false
        //     console.log('END - getDeviceFromDb()')
        //     if (response.data)
        //         return response.data
        //     else
        //         return null
        // },
        //
        //DELETE DEVICE
        //
        // async deleteDeviceDb(deviceId: number) {
        //     console.log('START - deleteDeviceDb()')
        //     await httpCommon.delete(`/v1/devices/` + deviceId)
        //     const index = this.devices.findIndex((dev: Device) => dev.id === deviceId)
        //     if (index !== -1) this.devices.splice(index, 1)
        //     console.log('END - deleteDeviceDb()')
        // },

        //ADD DEVICE
        //
        // async addDeviceDb(device: Device) {
        //     console.log('START - addDeviceDb()')
        //     const transformedDevice = {
        //         ...device,
        //         purchaseDate: device.purchaseDate ? moment(device.purchaseDate).format("YYYY-MM-DD") : null,
        //         sellDate: device.sellDate ? moment(device.sellDate).format("YYYY-MM-DD") : null,
        //         warrantyEndDate: device.warrantyEndDate ? moment(device.warrantyEndDate).format("YYYY-MM-DD") : null,
        //         insuranceEndDate: device.insuranceEndDate ? moment(device.insuranceEndDate).format("YYYY-MM-DD") : null,
        //     };
        //     console.log('addDeviceDb',transformedDevice)
        //
        //     const response = await httpCommon.post(`/v1/devices`, transformedDevice)
        //     this.devices.push(response.data)
        //     console.log('END - addDeviceDb()')
        // },

        //
        //UPDATE DEVICE
        //down
        // async updateDeviceDb(device: Device) {
        //     console.log('START - updateDeviceDb()', device)
        //     const transformedDevice = {
        //         ...device,
        //         purchaseDate: device.purchaseDate ? moment(device.purchaseDate).format("YYYY-MM-DD") : null,
        //         sellDate: device.sellDate ? moment(device.sellDate).format("YYYY-MM-DD") : null,
        //         warrantyEndDate: device.warrantyEndDate ? moment(device.warrantyEndDate).format("YYYY-MM-DD") : null,
        //         insuranceEndDate: device.insuranceEndDate ? moment(device.insuranceEndDate).format("YYYY-MM-DD") : null,
        //     };
        //     console.log('updateDeviceDb',transformedDevice)
        //     const response = await httpCommon.put(`/v1/devices`, transformedDevice)
        //     const index = this.rooms.findIndex((dev: Device) => dev.id === device.id)
        //     if (index !== -1) this.devices.splice(index, 1, response.data)
        //     console.log('END - updateDeviceDb()')
        // },


    },
})
