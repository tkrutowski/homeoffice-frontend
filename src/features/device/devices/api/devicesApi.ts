import moment from 'moment';
import httpCommon from '@/config/http-common';
import type { Device, DeviceType } from '@/features/device/devices/types';
import type { ActiveStatus } from '@/types/ActiveStatus';
import type { FileInfo } from '@/types/FileInfo';

function parseDeviceDates(device: Device): Device {
  const detailsRaw = device.details as unknown;
  const details =
    detailsRaw instanceof Map
      ? detailsRaw
      : new Map<string, string>(Object.entries((detailsRaw as Record<string, string>) ?? {}));

  return {
    ...device,
    details,
    purchaseDate: device.purchaseDate ? new Date(device.purchaseDate) : null,
    sellDate: device.sellDate ? new Date(device.sellDate) : null,
    warrantyEndDate: device.warrantyEndDate ? new Date(device.warrantyEndDate) : null,
    insuranceEndDate: device.insuranceEndDate ? new Date(device.insuranceEndDate) : null,
    files: device.files ?? [],
  };
}

function toDevicePayload(device: Device) {
  return {
    ...device,
    purchaseDate: device.purchaseDate ? moment(device.purchaseDate).format('YYYY-MM-DD') : null,
    sellDate: device.sellDate ? moment(device.sellDate).format('YYYY-MM-DD') : null,
    warrantyEndDate: device.warrantyEndDate ? moment(device.warrantyEndDate).format('YYYY-MM-DD') : null,
    insuranceEndDate: device.insuranceEndDate ? moment(device.insuranceEndDate).format('YYYY-MM-DD') : null,
    details: Object.fromEntries(device.details instanceof Map ? device.details : new Map()),
  };
}

export async function fetchDevices(): Promise<Device[]> {
  const response = await httpCommon.get(`/v1/devices`);
  return (response.data ?? []).map(parseDeviceDates);
}

export async function fetchDevice(deviceId: number): Promise<Device | null> {
  const response = await httpCommon.get(`/v1/devices/${deviceId}`);
  return response.data ? parseDeviceDates(response.data) : null;
}

export async function createDevice(device: Device): Promise<Device> {
  const response = await httpCommon.post(`/v1/devices`, toDevicePayload(device));
  return parseDeviceDates(response.data);
}

export async function updateDevice(device: Device): Promise<Device> {
  const response = await httpCommon.put(`/v1/devices`, toDevicePayload(device));
  return parseDeviceDates(response.data);
}

export async function deleteDevice(deviceId: number): Promise<void> {
  await httpCommon.delete(`/v1/devices/${deviceId}`);
}

export async function updateDeviceStatus(deviceId: number, status: ActiveStatus): Promise<void> {
  await httpCommon.put(`/v1/devices/status/${deviceId}?status=${status}`);
}

export async function fetchDeviceTypes(): Promise<DeviceType[]> {
  const response = await httpCommon.get(`/v1/devices/type`);
  return response.data ?? [];
}

export async function createDeviceType(deviceType: DeviceType): Promise<DeviceType> {
  const response = await httpCommon.post(`/v1/devices/type`, deviceType);
  return response.data;
}

export async function linkDeviceFiles(idDevice: number, files: FileInfo[]): Promise<Device> {
  const response = await httpCommon.post(`/v1/devices/files/${idDevice}`, files);
  return parseDeviceDates(response.data);
}
