import {defineStore} from "pinia";
import httpCommon from "@/http-common";
import {ErrorService} from "@/service/ErrorService";
import {Device, DeviceDto, DeviceType} from "@/types/Devices.ts";
import {ActiveStatus} from "@/types/Bank.ts";

export const useDevicesStore = defineStore("device", {
    state: () => ({
        loadingDevices: false,
        loadingDeviceTypes: false,

        devicesTypes: [] as DeviceType[],
        devices: [] as Device[],
    }),

    //getters = computed
    getters: {
        // getSortedSeries: (state) =>
        //     state.series.filter(serie => serie.id != 2)
        //         .sort((a, b) => a.title.localeCompare(b.title)),
        getDevicesDtos: (state) => {
            const devices = JSON.parse(JSON.stringify(state.devices));
            return devices.map(dev => {
                const dto: DeviceDto = {};
                dto.id = dev.id;
                dto.deviceType = dev.deviceType.name;
                dto.firm = dev.firm.name;
                dto.name = dev.name;
                dto.purchaseDate = new Date(dev.purchaseDate);
                dto.purchaseAmount = dev.purchaseAmount;
                dto.sellDate = new Date(dev.sellDate);
                dto.sellAmount = dev.sellAmount;
                dto.warrantyEndDate = new Date(dev.warrantyEndDate);
                dto.insuranceEndDate = new Date(dev.insuranceEndDate);
                dto.otherInfo = dev.otherInfo;
                dto.insurance = dev.insurance;
                dto.warranty = dev.warranty;
                dto.activeStatus = dev.activeStatus;
                dto.idComputer = dev.idComputer;
                return dto;
            });
        },
    },

    //actions = metody w komponentach
    actions: {
        //
        //REFRESH BOOKS
        //
        refreshDevices() {
            this.getDevicesFromDB();
        },
        //
        //GET DEVICES
        //
        async getDevices() {
            console.log("START - getDevices()");
            if (this.devices.length === 0 && !this.loadingDevices) {
                await this.getBooksFromDb();
            }
            console.log("END - getDevices()");

            return this.devices;
        },
        //-------------------------------------------------------DATABASE
        //
        //GET DEVICES FROM DB
        //
        async getDevicesFromDB(): Promise<void> {
            console.log("START - getDevicesFromDB()");
            this.loadingDevices = true;

            try {
                const response = await httpCommon.get(`/v1/devices`);
                console.log("getDevices() - Ilosc[]: " + response.data.length);
                this.devices = response.data;
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log("ERROR getDevicesFromDB(): ", e);
                    ErrorService.validateError(e);
                } else {
                    console.log("An unexpected error occurred: ", e);
                }
            } finally {
                this.loadingDevices = false;
                console.log("END - getDevicesFromDB()");
            }
        },
        //
        //GET  DEVICE FROM DB BY ID
        //
        async getDeviceFromDb(deviceId: number): Promise<Device | undefined> {
            console.log("START - getDeviceFromDb(" + deviceId + ")");
            this.loadingDevices = true;

            try {
                const response = await httpCommon.get(`/v1/devices/` + deviceId);
                console.log("getDeviceFromDb",response.data);
                return response.data;
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log("ERROR getDeviceFromDb(): ", e);
                    ErrorService.validateError(e);
                } else {
                    console.log("An unexpected error occurred: ", e);
                }
            } finally {
                this.loadingDevices = false;
                console.log("END - getDeviceFromDb()");
            }
        },
        //
        //DELETE DEVICE
        //
        async deleteDeviceDb(deviceId: number) {
            console.log("START - deleteDeviceDb()");
            try {
                await httpCommon.delete(`/v1/devices/` + deviceId);
                const index = this.devices.findIndex((l) => l.id === deviceId);
                if (index !== -1) this.devices.splice(index, 1);
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log("ERROR deleteDeviceDb(): ", e);
                    ErrorService.validateError(e);
                } else {
                    console.log("An unexpected error occurred: ", e);
                }
            } finally {
                console.log("END - deleteDeviceDb()");
            }
        },

        //ADD DEVICE
        //
        async addDeviceDb(device: Device) {
            console.log("START - addDeviceDb()");
            try {
                const response = await httpCommon.post(`/v1/devices`, device);
                this.devices.push(response.data);
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log("ERROR addDeviceDb(): ", e);
                    ErrorService.validateError(e);
                } else {
                    console.log("An unexpected error occurred: ", e);
                }
            } finally {
                console.log("END - addDeviceDb()");
            }
        },

        //
        //UPDATE DEVICE
        //
        async updateDeviceDb(device: Device) {
            console.log("START - updateDeviceDb()", device);
            try {
                const response = await httpCommon.put(`/v1/devices`, device);
                const index = this.devices.findIndex((b) => b.id === device.id);
                if (index !== -1) this.devices.splice(index, 1, response.data);
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log("ERROR updateDeviceDb(): ", e);
                    ErrorService.validateError(e);
                } else {
                    console.log("An unexpected error occurred: ", e);
                }
            } finally {
                console.log("END - updateDeviceDb()");
            }
        },

        //
        //CHANGE ACTIVE STATUS
        //
        async updateStatusDb(deviceId: number, status: ActiveStatus) {
            console.log("START - updateStatusDb()");
            try {
                await httpCommon.put(`/v1/devices/status/${deviceId}?status=${status}`);
                const device = this.devices.find((dev) => dev.id === deviceId);
                if (device) {
                    device.activeStatus = status;
                }
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log("ERROR updateStatusDb(): ", e);
                    ErrorService.validateError(e);
                } else {
                    console.log("An unexpected error occurred: ", e);
                }
            } finally {
                console.log("END - updateStatusDb()");
            }
        },

        //-------------------------------------------------------DEVICE TYPE---------------------------------------
        //
        //GET DEVICE TYPE FROM DB
        //
        async getDeviceTypesFromDb(): Promise<void> {
            console.log("START - getDeviceTypesFromDb()");
            this.loadingDeviceTypes = true;
            try {
                const response = await httpCommon.get(`/v1/devices/type`);
                console.log("getDeviceTypesFromDb() - Ilosc[]: " + response.data.length);
                this.devicesTypes = response.data;
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log("ERROR getDeviceTypesFromDb(): ", e);
                    ErrorService.validateError(e);
                } else {
                    console.log("An unexpected error occurred: ", e);
                }
            } finally {
                this.loadingDeviceTypes = false;
                console.log("END - getDeviceTypesFromDb()");
            }
        },
        //
        //GET SERIES FROM DB
        //
        async getDevicesTypeByIdFromDb(id:number): Promise<DeviceType> {
            console.log("START - getSeriesFromDb()");
            this.loadingDeviceTypes = true;
            try {
                const response = await httpCommon.get(`/v1/devices/type/${id}`);
                console.log("getDevicesTypeByIdFromDb() - Ilosc[]: " + response.data.length);
                return response.data;
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log("ERROR getDevicesTypeByIdFromDb(): ", e);
                    ErrorService.validateError(e);
                } else {
                    console.log("An unexpected error occurred: ", e);
                }
            } finally {
                this.loadingDeviceTypes = false;
                console.log("END - getDevicesTypeByIdFromDb()");
            }
        },

        //
        //UPDATE SERIES
        //
        async updateDeviceTypeDb(deviceType: DeviceType) {
            console.log("START - updateDeviceTypeDb()");
            try {
                const response = await httpCommon.put(`/v1/devices/type`, deviceType);

                const index = this.devicesTypes.findIndex((s) => s.id === deviceType.id);
                if (index !== -1) this.devicesTypes.splice(index, 1, response.data);
                return response.data;
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log("ERROR updateDeviceTypeDb(): ", e);
                    ErrorService.validateError(e);
                } else {
                    console.log("An unexpected error occurred: ", e);
                }
            } finally {
                console.log("END - updateDeviceTypeDb()");
            }
        },
        //ADD DEVICE TYPE
        //
        async addDeviceTypeDb(dev: DeviceType) {
            console.log("START - addDeviceTypeDb()");
            try {
                const response = await httpCommon.post(`/v1/devices/type`, dev);
                this.devicesTypes.push(response.data);
                return true;
            } catch (e) {
                if (ErrorService.isAxiosError(e)) {
                    console.log("ERROR addDeviceTypeDb(): ", e);
                    ErrorService.validateError(e);
                } else {
                    console.log("An unexpected error occurred: ", e);
                }
            } finally {
                console.log("END - addDeviceTypeDb()");
            }
        },
    },
});
