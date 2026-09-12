import type { Loan } from '@/features/finance/loans/types';

export enum LoanProposalStatus {
  NEW = 'NEW',
  EXTRACTED = 'EXTRACTED',
  FAILED = 'FAILED',
  ACCEPTED = 'ACCEPTED',
  IGNORED = 'IGNORED',
}

/**
 * Propozycja zakupu wyodrębniona z e-maila (np. PayPo, Allegro) — niezależna od `proposedLoan`.
 * Celowo nie ma `paymentDeadline` — ten termin zależy od karty wybranej przez użytkownika
 * i jest liczony po stronie backendu (patrz `fetchPurchasePaymentDeadline`).
 */
export interface ProposedPurchase {
  name: string;
  amount: number;
  purchaseDate: Date;
  otherInfo: string | null;
}

export interface LoanProposal {
  id: number;
  sourceMessageId: string;
  /** Nadawca z nagłówka e-maila (przy przekazywaniu może to być np. adres pośredniczący, a nie faktyczny nadawca). */
  sourceEmailFrom: string | null;
  sourceSubject: string | null;
  sourceFileS3Key: string | null;
  status: LoanProposalStatus;
  proposedLoan: Loan | null;
  /** Niezależna od `proposedLoan` — może być wypełniona razem z nią (typowo PayPo/Allegro) albo samodzielnie. */
  proposedPurchase: ProposedPurchase | null;
  /** Faktyczny nadawca wyodrębniony przez Claude z treści e-maila (dokładniejszy niż `sourceEmailFrom` przy przekazanych wiadomościach). */
  originalSenderEmail: string | null;
  /** Id dopasowanego banku — backend nie zwraca dla propozycji pełnego obiektu `Bank`, tylko jego id do dopasowania na froncie. */
  bankId: number | null;
  failureReason: string | null;
  createdLoanId: number | null;
  createdPurchaseId: number | null;
  receivedAt: Date;
  handledAt: Date | null;
  handledByUserId: number | null;
}
