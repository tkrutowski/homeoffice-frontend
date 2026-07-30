import httpCommon from '@/config/http-common';
import type { Computer } from '@/features/device/computers/types';
import type { ActiveStatus } from '@/types/ActiveStatus';

export async function fetchComputers(): Promise<Computer[]> {
  const response = await httpCommon.get(`/v1/computer`);
  return response.data ?? [];
}

export async function fetchComputer(computerId: number): Promise<Computer | null> {
  const response = await httpCommon.get(`/v1/computer/${computerId}`);
  return response.data ?? null;
}

export async function createComputer(computer: Computer): Promise<Computer> {
  const response = await httpCommon.post(`/v1/computer`, computer);
  return response.data;
}

export async function updateComputer(computer: Computer): Promise<Computer> {
  const response = await httpCommon.put(`/v1/computer`, computer);
  return response.data;
}

export async function deleteComputer(computerId: number): Promise<void> {
  await httpCommon.delete(`/v1/computer/${computerId}`);
}

export async function updateComputerStatus(computerId: number, status: ActiveStatus): Promise<void> {
  await httpCommon.put(`/v1/computer/status/${computerId}?status=${status}`);
}
