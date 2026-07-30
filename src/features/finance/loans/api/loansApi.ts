import moment from 'moment';
import httpCommon from '@/config/http-common';
import type { Loan, LoanInstallment } from '@/features/finance/loans/types';
import type { LoanPageParams } from '@/features/finance/_shared/queryKeys';
import type { StatusType } from '@/types/StatusType';
import { PaymentStatus } from '@/features/finance/payments/types';

export type LoansPageResult = {
  content: Loan[];
  totalElements: number;
  number: number;
};

function parseLoanInstallment(installment: LoanInstallment): LoanInstallment {
  return {
    ...installment,
    paymentDeadline: installment.paymentDeadline ? new Date(installment.paymentDeadline) : null,
    paymentDate: installment.paymentDate ? new Date(installment.paymentDate) : null,
  };
}

function parseLoan(loan: Loan): Loan {
  return {
    ...loan,
    date: loan.date ? new Date(loan.date) : null,
    firstPaymentDate: loan.firstPaymentDate ? new Date(loan.firstPaymentDate) : null,
    installmentList: (loan.installmentList ?? []).map(parseLoanInstallment),
  };
}

function buildLoanSearchParams(params: LoanPageParams): URLSearchParams {
  const search = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
    sort: params.sort,
    direction: params.direction,
  });
  if (params.globalFilter) search.append('globalFilter', params.globalFilter);
  if (params.name) search.append('name', params.name);
  if (params.idBank) search.append('idBank', params.idBank.toString());
  if (params.idUser) search.append('idUser', params.idUser.toString());
  if (params.date) search.append('date', params.date);
  if (params.dateComparisonType) search.append('dateComparisonType', params.dateComparisonType);
  if (params.amount !== undefined && params.amount !== null) search.append('amount', params.amount.toString());
  if (params.amountComparisonType) search.append('amountComparisonType', params.amountComparisonType);
  if (params.status) search.append('status', params.status);
  return search;
}

export async function fetchLoansPage(params: LoanPageParams): Promise<LoansPageResult> {
  const search = buildLoanSearchParams(params);
  const response = await httpCommon.get(`/v1/finance/loan/page?${search.toString()}`);
  return {
    content: (response.data.content ?? []).map(parseLoan),
    totalElements: response.data.totalElements,
    number: response.data.number,
  };
}

export async function fetchLoan(loanId: number): Promise<Loan | null> {
  const response = await httpCommon.get(`/v1/finance/loan/${loanId}`);
  return response.data ? parseLoan(response.data) : null;
}

function toLoanPayload(loan: Loan) {
  return {
    ...loan,
    date: loan.date ? moment(loan.date).format('YYYY-MM-DD') : null,
    firstPaymentDate: loan.firstPaymentDate ? moment(loan.firstPaymentDate).format('YYYY-MM-DD') : null,
  };
}

export async function createLoan(loan: Loan): Promise<Loan> {
  const response = await httpCommon.post(`/v1/finance/loan`, toLoanPayload(loan));
  return parseLoan(response.data);
}

export async function updateLoan(loan: Loan): Promise<Loan> {
  const response = await httpCommon.put(`/v1/finance/loan`, toLoanPayload(loan));
  return parseLoan(response.data);
}

export async function deleteLoan(loanId: number): Promise<void> {
  await httpCommon.delete(`/v1/finance/loan/${loanId}`);
}

export async function updateLoanStatus(loanId: number, status: PaymentStatus): Promise<void> {
  await httpCommon.put(`/v1/finance/loan/status/${loanId}`, { value: status });
}

export async function updateLoanInstallment(installment: LoanInstallment): Promise<Loan | null> {
  const payload = {
    ...installment,
    paymentDeadline: installment.paymentDeadline ? moment(installment.paymentDeadline).format('YYYY-MM-DD') : null,
    paymentDate: installment.paymentDate ? moment(installment.paymentDate).format('YYYY-MM-DD') : null,
  };
  await httpCommon.put(`/v1/finance/loan/installment`, payload);
  return fetchLoan(installment.idLoan);
}

export async function fetchLoansByYearAndStatusAndUser(
  year: number,
  status: StatusType,
  userId?: number
): Promise<Loan[]> {
  const params: LoanPageParams = {
    page: 0,
    size: 1000,
    sort: 'date',
    direction: 'DESC',
  };
  if (status === 'TO_PAY' || status === 'PAID') params.status = status;
  if (userId) params.idUser = userId;

  const { content } = await fetchLoansPage(params);
  return content.filter(loan =>
    loan.installmentList.some(
      installment => installment.paymentDeadline && new Date(installment.paymentDeadline).getFullYear() === year
    )
  );
}
