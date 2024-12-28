import {defineStore} from 'pinia'
import httpCommon from '../config/http-common'
import type {Device, DeviceDto, DeviceType} from '../types/Devices.ts'
import type {ActiveStatus} from '../types/Bank.ts'
import moment from "moment";

export const useDevicesStore = defineStore('device', {
    state: () => ({
        loadingDevices: false,
        loadingDeviceTypes: false,
        rowsPerPage: parseInt(localStorage.getItem('rowsPerPageDevices') || '20', 10),

        devicesTypes: [] as DeviceType[],
        devices: [] as Device[],
    }),

    //getters = computed
    getters: {
        // getSortedSeries: (state) =>
        //     state.series.filter(serie => serie.id != 2)
        //         .sort((a, b) => a.title.localeCompare(b.title)),
        getDevicesDtos: (state) => {
            const devices: Device[] = JSON.parse(JSON.stringify(state.devices))
            return devices.map((dev) => {
                const dto: DeviceDto = {
                    id: dev.id,
                    deviceType: dev.deviceType?.name,
                    firm: dev.firm!.name,
                    name: dev.name,
                    purchaseDate: dev.purchaseDate,
                    purchaseAmount: dev.purchaseAmount,
                    sellDate: dev.sellDate,
                    sellAmount: dev.sellAmount,
                    warrantyEndDate: dev.warrantyEndDate,
                    insuranceEndDate: dev.insuranceEndDate,
                    otherInfo: dev.otherInfo,
                    activeStatus: dev.activeStatus,
                }
                return dto
            })
        },
    },

    //actions = metody w komponentach
    actions: {
        //
        //REFRESH BOOKS
        //
        async refreshDevices() {
            this.devices = await this.getDevicesFromDB()
            await this.getDeviceTypesFromDb()
        },
        //
        //GET DEVICES
        //
        async getDevices() {
            console.log('START - getDevices()')
            if (this.devices.length === 0 && !this.loadingDevices) {
                 await this.refreshDevices()
            }

            console.log('END - getDevices()')

            return this.devices
        },
        async getDevice(idDevice:number) {
            console.log('START - getDevice()',idDevice)
            let dev = this.devices.find((dev: Device) => dev.id === idDevice);

            if (!dev) {
               dev = await this.getDeviceFromDb(idDevice)
            }

            console.log('END - getDevices()')

            return dev || null
        },
        //-------------------------------------------------------DATABASE
        //
        //GET DEVICES FROM DB
        //
        async getDevicesFromDB(): Promise<Device[]> {
            console.log('START - getDevicesFromDB()')
            this.loadingDevices = true

            const response = await httpCommon.get(`/v1/devices`)
            console.log('getDevices() - Ilosc[]: ' + response.data.length)
            this.loadingDevices = false
            console.log('END - getDevicesFromDB()')
            return response.data
        },
        //
        //GET  DEVICE FROM DB BY ID
        //
        async getDeviceFromDb(deviceId: number): Promise<Device | null> {
            console.log('START - getDeviceFromDb(' + deviceId + ')')
            this.loadingDevices = true

            const response = await httpCommon.get(`/v1/devices/` + deviceId)
            this.loadingDevices = false
            console.log('END - getDeviceFromDb()')
            if (response.data)
                return response.data
            else
                return null
        },
        //
        //DELETE DEVICE
        //
        async deleteDeviceDb(deviceId: number) {
            console.log('START - deleteDeviceDb()')
            await httpCommon.delete(`/v1/devices/` + deviceId)
            const index = this.devices.findIndex((dev: Device) => dev.id === deviceId)
            if (index !== -1) this.devices.splice(index, 1)
            console.log('END - deleteDeviceDb()')
        },

        //ADD DEVICE
        //
        async addDeviceDb(device: Device) {
            console.log('START - addDeviceDb()')
            const transformedDevice = {
                ...device,
                purchaseDate: device.purchaseDate ? moment(device.purchaseDate).format("YYYY-MM-DD") : null,
                sellDate: device.sellDate ? moment(device.sellDate).format("YYYY-MM-DD") : null,
                warrantyEndDate: device.warrantyEndDate ? moment(device.warrantyEndDate).format("YYYY-MM-DD") : null,
                insuranceEndDate: device.insuranceEndDate ? moment(device.insuranceEndDate).format("YYYY-MM-DD") : null,
            };
            console.log('addDeviceDb',transformedDevice)

            const response = await httpCommon.post(`/v1/devices`, transformedDevice)
            this.devices.push(response.data)
            console.log('END - addDeviceDb()')
        },

        //
        //UPDATE DEVICE
        //down
        async updateDeviceDb(device: Device) {
            console.log('START - updateDeviceDb()', device)
            const transformedDevice = {
                ...device,
                purchaseDate: device.purchaseDate ? moment(device.purchaseDate).format("YYYY-MM-DD") : null,
                sellDate: device.sellDate ? moment(device.sellDate).format("YYYY-MM-DD") : null,
                warrantyEndDate: device.warrantyEndDate ? moment(device.warrantyEndDate).format("YYYY-MM-DD") : null,
                insuranceEndDate: device.insuranceEndDate ? moment(device.insuranceEndDate).format("YYYY-MM-DD") : null,
            };
            console.log('updateDeviceDb',transformedDevice)
            const response = await httpCommon.put(`/v1/devices`, transformedDevice)
            const index = this.devices.findIndex((dev: Device) => dev.id === device.id)
            if (index !== -1) this.devices.splice(index, 1, response.data)
            console.log('END - updateDeviceDb()')
        },

        //
        //CHANGE ACTIVE STATUS
        //
        async updateStatusDb(deviceId: number, status: ActiveStatus) {
            console.log('START - updateStatusDb()')
            await httpCommon.put(`/v1/devices/status/${deviceId}?status=${status}`)
            const device = this.devices.find((dev: Device) => dev.id === deviceId)
            if (device) {
                device.activeStatus = status
            }
            console.log('END - updateStatusDb()')
        },

        //-------------------------------------------------------DEVICE TYPE---------------------------------------
        //
        //GET DEVICE TYPE FROM DB
        //
        async getDeviceTypesFromDb(): Promise<void> {
            console.log('START - getDeviceTypesFromDb()')
            this.loadingDeviceTypes = true
            const response = await httpCommon.get(`/v1/devices/type`)
            console.log('getDeviceTypesFromDb() - Ilosc[]: ' + response.data.length)
            this.devicesTypes = response.data
            this.loadingDeviceTypes = false
            console.log('END - getDeviceTypesFromDb()')
        },
        //
        //GET  DEVICE TYPE FROM DB
        //
        async getDevicesTypeByIdFromDb(id: number): Promise<DeviceType | null> {
            console.log('START - getSeriesFromDb()')
            this.loadingDeviceTypes = true
            const response = await httpCommon.get(`/v1/devices/type/${id}`)
            console.log('getDevicesTypeByIdFromDb() - Ilosc[]: ' + response.data.length)
            this.loadingDeviceTypes = false
            console.log('END - getDevicesTypeByIdFromDb()')
            return response.data
        },

        //
        //UPDATE DEVICE TYPE
        //
        async updateDeviceTypeDb(deviceType: DeviceType): Promise<DeviceType> {
            console.log('START - updateDeviceTypeDb()')
            const response = await httpCommon.put(`/v1/devices/type`, deviceType)

            const index = this.devicesTypes.findIndex((dev: DeviceType) => dev.id === deviceType.id)
            if (index !== -1) this.devicesTypes.splice(index, 1, response.data)
            console.log('END - updateDeviceTypeDb()')
            return response.data
        },
        //ADD DEVICE TYPE
        //
        async addDeviceTypeDb(dev: DeviceType) {
            console.log('START - addDeviceTypeDb()')
            const response = await httpCommon.post(`/v1/devices/type`, dev)
            this.devicesTypes.push(response.data)
            console.log('END - addDeviceTypeDb()')
        },
    },
})
