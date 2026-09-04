import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  createComputer,
  deleteComputer,
  updateComputer,
  updateComputerStatus,
} from '@/features/device/computers/api/computersApi';
import { deviceKeys } from '@/features/device/_shared/queryKeys';
import type { Computer } from '@/features/device/computers/types';
import type { ActiveStatus } from '@/types/ActiveStatus';

export function useCreateComputerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (computer: Computer) => createComputer(computer),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.computers.all() });
    },
  });
}

export function useUpdateComputerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (computer: Computer) => updateComputer(computer),
    onSuccess: computer => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.computers.all() });
      if (computer.id) {
        void queryClient.invalidateQueries({ queryKey: deviceKeys.computers.detail(computer.id) });
      }
    },
  });
}

export function useDeleteComputerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (computerId: number) => deleteComputer(computerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.computers.all() });
    },
  });
}

export function useUpdateComputerStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      computerId,
      status,
      type,
    }: {
      computerId: number;
      status: ActiveStatus;
      type: 'DESKTOP' | 'LAPTOP';
    }) => updateComputerStatus(computerId, status, type),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.computers.all() });
    },
  });
}
