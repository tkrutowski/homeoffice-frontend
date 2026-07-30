import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  createDevice,
  createDeviceType,
  deleteDevice,
  linkDeviceFiles,
  updateDevice,
  updateDeviceStatus,
} from '@/features/device/devices/api/devicesApi';
import { deviceKeys } from '@/features/device/_shared/queryKeys';
import type { Device, DeviceType } from '@/features/device/devices/types';
import type { ActiveStatus } from '@/types/ActiveStatus';
import type { FileInfo } from '@/types/FileInfo';

export function useCreateDeviceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (device: Device) => createDevice(device),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.devices.all() });
    },
  });
}

export function useUpdateDeviceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (device: Device) => updateDevice(device),
    onSuccess: device => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.devices.all() });
      void queryClient.invalidateQueries({ queryKey: deviceKeys.devices.detail(device.id) });
    },
  });
}

export function useDeleteDeviceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deviceId: number) => deleteDevice(deviceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.devices.all() });
    },
  });
}

export function useUpdateDeviceStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId, status }: { deviceId: number; status: ActiveStatus }) =>
      updateDeviceStatus(deviceId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.devices.all() });
    },
  });
}

export function useCreateDeviceTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deviceType: DeviceType) => createDeviceType(deviceType),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.devices.types() });
    },
  });
}

export function useLinkDeviceFilesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idDevice, files }: { idDevice: number; files: FileInfo[] }) => linkDeviceFiles(idDevice, files),
    onSuccess: device => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.devices.all() });
      void queryClient.invalidateQueries({ queryKey: deviceKeys.devices.detail(device.id) });
    },
  });
}
