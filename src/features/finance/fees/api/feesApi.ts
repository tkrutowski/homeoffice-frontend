import moment from 'moment';
import httpCommon from '@/config/http-common';
import type { Fee, FeeFrequency, FeeInstallment } from '@/features/finance/fees/types';
import type { FeePageParams } from '@/features/finance/_shared/queryKeys';
import type { StatusType } from '@/types/StatusType';
import { PaymentStatus } from '@/features/finance/payments/types';

export type FeesPageResult = {
  content: Fee[];
  totalElements: number;
  number: number;
};

function parseFeeInstallment(installment: FeeInstallment): FeeInstallment {
  return {
    ...installment,
    paymentDeadline: installment.paymentDeadline ? new Date(installment.paymentDeadline) : null,
    paymentDate: installment.paymentDate ? new Date(installment.paymentDate) : null,
  };
}

function parseFee(fee: Fee): Fee {
  return {
    ...fee,
    date: fee.date ? new Date(fee.date) : null,
    firstPaymentDate: fee.firstPaymentDate ? new Date(fee.firstPaymentDate) : null,
    installmentList: (fee.installmentList ?? []).map(parseFeeInstallment),
  };
}

function buildFeeSearchParams(params: FeePageParams): URLSearchParams {
  const search = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
    sort: params.sort,
    direction: params.direction,
  });
  if (params.globalFilter) search.append('globalFilter', params.globalFilter);
  if (params.name) search.append('name', params.name);
  if (params.idFirm) search.append('idFirm', params.idFirm.toString());
  if (params.idUser) search.append('idUser', params.idUser.toString());
  if (params.date) search.append('date', params.date);
  if (params.dateComparisonType) search.append('dateComparisonType', params.dateComparisonType);
  if (params.amount !== undefined && params.amount !== null) search.append('amount', params.amount.toString());
  if (params.amountComparisonType) search.append('amountComparisonType', params.amountComparisonType);
  if (params.status) search.append('status', params.status);
  return search;
}

export async function fetchFeesPage(params: FeePageParams): Promise<FeesPageResult> {
  const search = buildFeeSearchParams(params);
  const response = await httpCommon.get(`/v1/finance/fee/page?${search.toString()}`);
  return {
    content: (response.data.content ?? []).map(parseFee),
    totalElements: response.data.totalElements,
    number: response.data.number,
  };
}

export async function fetchFee(feeId: number): Promise<Fee | null> {
  const response = await httpCommon.get(`/v1/finance/fee/${feeId}`);
  return response.data ? parseFee(response.data) : null;
}

function toFeePayload(fee: Fee) {
  return {
    ...fee,
    date: fee.date ? moment(fee.date).format('YYYY-MM-DD') : null,
    firstPaymentDate: fee.firstPaymentDate ? moment(fee.firstPaymentDate).format('YYYY-MM-DD') : null,
  };
}

export async function createFee(fee: Fee): Promise<Fee> {
  const response = await httpCommon.post(`/v1/finance/fee`, toFeePayload(fee));
  return parseFee(response.data);
}

export async function updateFee(fee: Fee): Promise<Fee> {
  const response = await httpCommon.put(`/v1/finance/fee`, toFeePayload(fee));
  return parseFee(response.data);
}

export async function deleteFee(feeId: number): Promise<void> {
  await httpCommon.delete(`/v1/finance/fee/${feeId}`);
}

export async function updateFeeStatus(feeId: number, status: PaymentStatus): Promise<void> {
  await httpCommon.put(`/v1/finance/fee/status/${feeId}`, { value: status });
}

export async function updateFeeInstallment(installment: FeeInstallment): Promise<Fee | null> {
  const payload = {
    ...installment,
    paymentDeadline: installment.paymentDeadline ? moment(installment.paymentDeadline).format('YYYY-MM-DD') : null,
    paymentDate: installment.paymentDate ? moment(installment.paymentDate).format('YYYY-MM-DD') : null,
  };
  await httpCommon.put(`/v1/finance/fee/installment`, payload);
  return fetchFee(installment.idFee);
}

export async function fetchFeeFrequencyTypes(): Promise<FeeFrequency[]> {
  const response = await httpCommon.get(`/v1/finance/fee/frequency`);
  return response.data ?? [];
}

export async function fetchFeesByYearAndStatusAndUser(
  year: number,
  status: StatusType,
  userId?: number
): Promise<Fee[]> {
  const params: FeePageParams = {
    page: 0,
    size: 1000,
    sort: 'date',
    direction: 'DESC',
  };
  if (status === 'TO_PAY' || status === 'PAID') params.status = status;
  if (userId) params.idUser = userId;

  const { content } = await fetchFeesPage(params);
  return content.filter(fee =>
    fee.installmentList.some(
      installment => installment.paymentDeadline && new Date(installment.paymentDeadline).getFullYear() === year
    )
  );
}
