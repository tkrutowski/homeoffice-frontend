import { useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { fetchDevice, fetchDevices, fetchDeviceTypes } from '@/features/device/devices/api/devicesApi';
import { deviceKeys } from '@/features/device/_shared/queryKeys';

export function useDevicesListQuery() {
  return useQuery({
    queryKey: deviceKeys.devices.list(),
    queryFn: fetchDevices,
  });
}

export function useDeviceQuery(deviceId: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: computed(() => deviceKeys.devices.detail(toValue(deviceId))),
    queryFn: () => fetchDevice(toValue(deviceId)),
    enabled: computed(() => toValue(enabled) && toValue(deviceId) > 0),
  });
}

export function useDeviceTypesQuery() {
  return useQuery({
    queryKey: deviceKeys.devices.types(),
    queryFn: fetchDeviceTypes,
  });
}
