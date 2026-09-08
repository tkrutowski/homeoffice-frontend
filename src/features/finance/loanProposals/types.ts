import type { Loan } from '@/features/finance/loans/types';

export enum LoanProposalStatus {
  NEW = 'NEW',
  EXTRACTED = 'EXTRACTED',
  FAILED = 'FAILED',
  ACCEPTED = 'ACCEPTED',
  IGNORED = 'IGNORED',
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
  /** Faktyczny nadawca wyodrębniony przez Claude z treści e-maila (dokładniejszy niż `sourceEmailFrom` przy przekazanych wiadomościach). */
  originalSenderEmail: string | null;
  /** Id dopasowanego banku — backend nie zwraca dla propozycji pełnego obiektu `Bank`, tylko jego id do dopasowania na froncie. */
  bankId: number | null;
  failureReason: string | null;
  createdLoanId: number | null;
  receivedAt: Date;
  handledAt: Date | null;
  handledByUserId: number | null;
}
