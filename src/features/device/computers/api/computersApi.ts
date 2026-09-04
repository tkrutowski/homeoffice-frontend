import httpCommon from '@/config/http-common';
import type { Computer } from '@/features/device/computers/types';
import type { ActiveStatus } from '@/types/ActiveStatus';

export async function fetchComputers(): Promise<Computer[]> {
  const response = await httpCommon.get(`/v1/computer`);
  return response.data ?? [];
}

/**
 * Pobierz pojedynczy komputer
 * @param computerId - ID komputera
 * @param type - Opcjonalnie: typ komputera (DESKTOP lub LAPTOP)
 *              Jeśli podany, backend zwróci właściwy JSON dla danego typu
 */
export async function fetchComputer(computerId: number, type?: 'DESKTOP' | 'LAPTOP'): Promise<Computer | null> {
  const queryParam = type ? `?type=${type}` : '';
  const response = await httpCommon.get(`/v1/computer/${computerId}${queryParam}`);
  return response.data ?? null;
}

export async function createComputer(computer: Computer): Promise<Computer> {
  const response = await httpCommon.post(`/v1/computer`, computer);
  return response.data;
}

/**
 * Zaktualizuj komputer
 * @param computer - Obiekt Computer ze wszystkimi polami (zawiera computerType)
 * Backend deserializuje typ na podstawie computerType w obiekcie
 */
export async function updateComputer(computer: Computer): Promise<Computer> {
  const response = await httpCommon.put(`/v1/computer`, computer);
  return response.data;
}

export async function deleteComputer(computerId: number): Promise<void> {
  await httpCommon.delete(`/v1/computer/${computerId}`);
}

/**
 * Aktualizuj status komputera
 * @param computerId - ID komputera
 * @param status - Status (ACTIVE lub INACTIVE)
 * @param type - Typ komputera (DESKTOP lub LAPTOP) - wymagany przez backend
 */
export async function updateComputerStatus(
  computerId: number,
  status: ActiveStatus,
  type: 'DESKTOP' | 'LAPTOP'
): Promise<void> {
  await httpCommon.put(`/v1/computer/status/${computerId}?status=${status}&type=${type}`);
}
