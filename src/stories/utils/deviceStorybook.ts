import { mockComputer, mockDevice, mockDeviceType } from '@/features/device/_shared/storybook/fixtures';
import { deviceKeys } from '@/features/device/_shared/queryKeys';
import { queryClient } from '@/config/queryClient';
import { useAuthorizationStore } from '@/stores/authorization';

const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJhdXRob3JpdGllcyI6WyJST0xFX0RFVklDRSIsIlJPTEVfQ09NUFVURVIiLCJST0xFX0FETUlOIl0sImV4cCI6NDA3MDkwODgwMH0.' +
  'signature';

export function setupDeviceStorybookStores() {
  const authStore = useAuthorizationStore();
  authStore.accessToken = mockToken;
  authStore.isAuthenticated = true;
  authStore.username = 'storybook';

  queryClient.setQueryData(deviceKeys.devices.list(), [mockDevice]);
  queryClient.setQueryData(deviceKeys.devices.detail(mockDevice.id), mockDevice);
  queryClient.setQueryData(deviceKeys.devices.types(), [mockDeviceType]);
  queryClient.setQueryData(deviceKeys.computers.list(), [mockComputer]);
  if (mockComputer.id) {
    queryClient.setQueryData(deviceKeys.computers.detail(mockComputer.id), mockComputer);
  }
}
