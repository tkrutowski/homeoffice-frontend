import httpCommon from '@/config/http-common';
import type { AsyncTaskStartResponse, BankCsvImportResponse } from '@/features/finance/transactions/csvImportTypes';

export type CsvImportJobResult = { status: 'pending' } | { status: 'ready'; data: BankCsvImportResponse };

export async function startCsvImportJob(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('csvFile', file);
  const response = await httpCommon.post<AsyncTaskStartResponse>('/v1/finance/bank-transaction/import/bank', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.jobId;
}

export async function fetchCsvImportJob(jobId: string): Promise<CsvImportJobResult> {
  const response = await httpCommon.get<BankCsvImportResponse>(
    `/v1/finance/bank-transaction/import/bank/jobs/${jobId}`,
    { validateStatus: status => status === 200 || status === 202 }
  );

  if (response.status === 202) {
    return { status: 'pending' };
  }

  return { status: 'ready', data: response.data };
}
