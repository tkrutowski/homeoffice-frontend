import httpCommon from '@/config/http-common';
import type { Bank } from '@/features/finance/banks/types';

function normalizeBank(bank: Bank): Bank {
  return {
    ...bank,
    address: bank.address ? bank.address : { id: 0, city: '', street: '', zip: '' },
  };
}

export async function fetchBanks(): Promise<Bank[]> {
  const response = await httpCommon.get(`/v1/finance/bank`);
  return (response.data ?? []).map(normalizeBank);
}

export async function fetchBank(bankId: number): Promise<Bank | null> {
  const response = await httpCommon.get(`/v1/finance/bank/${bankId}`);
  return response.data ? normalizeBank(response.data) : null;
}

export async function createBank(bank: Bank): Promise<Bank> {
  const response = await httpCommon.post(`/v1/finance/bank`, bank);
  return response.data;
}

export async function updateBank(bank: Bank): Promise<Bank> {
  const response = await httpCommon.put(`/v1/finance/bank`, bank);
  return response.data;
}

export async function deleteBank(bankId: number): Promise<void> {
  await httpCommon.delete(`/v1/finance/bank/${bankId}`);
}
