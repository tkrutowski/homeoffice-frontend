import moment from 'moment';
import httpCommon from '@/config/http-common';
import { parseLoan, toLoanPayload } from '@/features/finance/loans/api/loansApi';
import type { Loan } from '@/features/finance/loans/types';
import type { Purchase } from '@/features/finance/purchases/types';
import { parsePurchase } from '@/features/finance/purchases/api/purchasesApi';
import type { LoanProposal, ProposedPurchase } from '@/features/finance/loanProposals/types';
import { LoanProposalStatus } from '@/features/finance/loanProposals/types';

type RawProposedLoan = (Loan & { originalSenderEmail?: string | null; bankId?: number | null }) | null;
type RawProposedPurchase = (Omit<ProposedPurchase, 'purchaseDate'> & { purchaseDate: string }) | null;

function parseLoanProposal(proposal: LoanProposal): LoanProposal {
  // Backend zwraca originalSenderEmail i bankId zagnieżdżone w proposedLoan (nie są to pola encji Loan) —
  // wyciągamy je stąd, żeby nie zaśmiecać typu Loan polami specyficznymi dla propozycji z e-maila.
  // bankId to jedynie id dopasowanego banku (bez pełnego obiektu Bank) — dopasowanie do listy banków
  // dzieje się na froncie w LoanView.vue, gdy tylko lista banków jest już załadowana.
  const rawProposedLoan = proposal.proposedLoan as RawProposedLoan;
  const rawProposedPurchase = proposal.proposedPurchase as unknown as RawProposedPurchase;
  const rawProposal = proposal as LoanProposal & { bankId?: number | null };
  return {
    ...proposal,
    proposedLoan: rawProposedLoan ? parseLoan(rawProposedLoan) : null,
    proposedPurchase: rawProposedPurchase
      ? { ...rawProposedPurchase, purchaseDate: new Date(rawProposedPurchase.purchaseDate) }
      : null,
    originalSenderEmail: rawProposedLoan?.originalSenderEmail ?? null,
    bankId: rawProposedLoan?.bankId ?? rawProposal.bankId ?? null,
    receivedAt: new Date(proposal.receivedAt),
    handledAt: proposal.handledAt ? new Date(proposal.handledAt) : null,
  };
}

export async function fetchLoanProposals(status?: LoanProposalStatus): Promise<LoanProposal[]> {
  const search = new URLSearchParams();
  if (status) search.append('status', status);
  const response = await httpCommon.get(`/v1/finance/loan-proposal?${search.toString()}`);
  return (response.data ?? []).map(parseLoanProposal);
}

export async function fetchLoanProposal(proposalId: number): Promise<LoanProposal | null> {
  const response = await httpCommon.get(`/v1/finance/loan-proposal/${proposalId}`);
  return response.data ? parseLoanProposal(response.data) : null;
}

export async function acceptLoanProposal(proposalId: number, loan: Loan): Promise<Loan> {
  const response = await httpCommon.post(`/v1/finance/loan-proposal/${proposalId}/accept`, toLoanPayload(loan));
  return parseLoan(response.data);
}

/**
 * Payload dla /accept-as-purchase — analogiczny do zwykłego zapisu zakupu (toPurchasePayload
 * w purchasesApi.ts), ale backend wymaga tu `amount` jako string (nie number), inaczej niż
 * przy POST/PUT /v1/finance/purchase. Stąd osobny serializer, żeby nie psuć tamtych ścieżek.
 */
function toAcceptAsPurchasePayload(purchase: Purchase) {
  return {
    ...purchase,
    purchaseDate: purchase.purchaseDate ? moment(purchase.purchaseDate).format('YYYY-MM-DD') : null,
    amount: String(purchase.amount),
    paymentDeadline: null,
    paymentDate: purchase.paymentDate ? moment(purchase.paymentDate).format('YYYY-MM-DD') : null,
  };
}

export async function acceptLoanProposalAsPurchase(proposalId: number, purchase: Purchase): Promise<Purchase> {
  const response = await httpCommon.post(
    `/v1/finance/loan-proposal/${proposalId}/accept-as-purchase`,
    toAcceptAsPurchasePayload(purchase)
  );
  return parsePurchase(response.data);
}

export async function ignoreLoanProposal(proposalId: number): Promise<void> {
  await httpCommon.post(`/v1/finance/loan-proposal/${proposalId}/ignore`);
}

export async function deleteLoanProposal(proposalId: number): Promise<void> {
  await httpCommon.delete(`/v1/finance/loan-proposal/${proposalId}`);
}
