import type { Bank } from '@/features/finance/banks/types';
import type { Card } from '@/features/finance/cards/types';
import type { Loan, LoanFromPurchasesDraft, LoanInstallment } from '@/features/finance/loans/types';
import type { Fee, FeeInstallment } from '@/features/finance/fees/types';
import type { Purchase } from '@/features/finance/purchases/types';
import type { LoanProposal } from '@/features/finance/loanProposals/types';
import { PaymentStatus } from '@/features/finance/payments/types';

export function cloneBank(bank: Bank): Bank {
  return {
    ...bank,
    address: { ...bank.address },
  };
}

export function cloneCard(card: Card): Card {
  return {
    ...card,
    activationDate: card.activationDate ? new Date(card.activationDate) : null,
    expirationDate: card.expirationDate ? new Date(card.expirationDate) : null,
  };
}

function cloneLoanInstallment(installment: LoanInstallment): LoanInstallment {
  return {
    ...installment,
    paymentDeadline: installment.paymentDeadline ? new Date(installment.paymentDeadline) : null,
    paymentDate: installment.paymentDate ? new Date(installment.paymentDate) : null,
  };
}

export function cloneLoan(loan: Loan): Loan {
  return {
    ...loan,
    bank: loan.bank ? cloneBank(loan.bank) : null,
    date: loan.date ? new Date(loan.date) : null,
    firstPaymentDate: loan.firstPaymentDate ? new Date(loan.firstPaymentDate) : null,
    installmentList: loan.installmentList.map(cloneLoanInstallment),
  };
}

function cloneFeeInstallment(installment: FeeInstallment): FeeInstallment {
  return {
    ...installment,
    paymentDeadline: installment.paymentDeadline ? new Date(installment.paymentDeadline) : null,
    paymentDate: installment.paymentDate ? new Date(installment.paymentDate) : null,
  };
}

export function cloneFee(fee: Fee): Fee {
  return {
    ...fee,
    firm: fee.firm ? { ...fee.firm, address: { ...fee.firm.address } } : null,
    date: fee.date ? new Date(fee.date) : null,
    firstPaymentDate: fee.firstPaymentDate ? new Date(fee.firstPaymentDate) : null,
    feeFrequency: fee.feeFrequency ? { ...fee.feeFrequency } : null,
    installmentList: fee.installmentList.map(cloneFeeInstallment),
  };
}

export function clonePurchase(purchase: Purchase): Purchase {
  return {
    ...purchase,
    purchaseDate: purchase.purchaseDate ? new Date(purchase.purchaseDate) : null,
    paymentDeadline: purchase.paymentDeadline ? new Date(purchase.paymentDeadline) : null,
    paymentDate: purchase.paymentDate ? new Date(purchase.paymentDate) : null,
  };
}

export function cloneLoanProposal(proposal: LoanProposal): LoanProposal {
  return {
    ...proposal,
    proposedLoan: proposal.proposedLoan ? cloneLoan(proposal.proposedLoan) : null,
    proposedPurchase: proposal.proposedPurchase
      ? { ...proposal.proposedPurchase, purchaseDate: new Date(proposal.proposedPurchase.purchaseDate) }
      : null,
    receivedAt: new Date(proposal.receivedAt),
    handledAt: proposal.handledAt ? new Date(proposal.handledAt) : null,
  };
}

/** Buduje świeży draft `Loan` (id:0, bez rat) na podstawie propozycji z e-maila — do wstępnego wypełnienia formularza kredytu. */
export function mapLoanProposalToLoanDraft(proposal: LoanProposal): Loan {
  const base = proposal.proposedLoan;
  return {
    id: 0,
    bank: base?.bank ? cloneBank(base.bank) : null,
    idUser: base?.idUser ?? 0,
    name: base?.name || proposal.sourceSubject || '',
    amount: base?.amount ?? 0,
    date: base?.date ? new Date(base.date) : new Date(),
    loanNumber: base?.loanNumber ?? '',
    accountNumber: base?.accountNumber ?? '',
    firstPaymentDate: base?.firstPaymentDate ? new Date(base.firstPaymentDate) : null,
    numberOfInstallments: base?.numberOfInstallments ?? 1,
    installmentAmount: base?.installmentAmount ?? 0,
    loanStatus: PaymentStatus.TO_PAY,
    loanCost: base?.loanCost ?? 0,
    otherInfo: base?.otherInfo ?? '',
    installmentList: [],
  };
}

/**
 * Buduje świeży draft `Loan` (id:0, bez rat) na podstawie podglądu zamiany zakupów na kredyt
 * (GET /finance/loan/from-purchases/draft) — do wstępnego wypełnienia formularza kredytu.
 * Bank i reszta danych ratalnych nie są sugerowane przez backend — użytkownik uzupełnia je ręcznie.
 */
export function mapPurchasesDraftToLoanDraft(draft: LoanFromPurchasesDraft): Loan {
  return {
    id: 0,
    bank: null,
    idUser: draft.purchases[0]?.idUser ?? 0,
    name: draft.suggestedName,
    amount: draft.suggestedAmount,
    date: draft.suggestedDate ?? new Date(),
    loanNumber: '',
    accountNumber: '',
    firstPaymentDate: null,
    numberOfInstallments: 1,
    installmentAmount: 0,
    loanStatus: PaymentStatus.TO_PAY,
    loanCost: 0,
    otherInfo: '',
    installmentList: [],
  };
}

/**
 * Buduje świeży draft `Purchase` (id:0) na podstawie propozycji z e-maila — do wstępnego wypełnienia
 * formularza zakupu. Kartę, firmę i użytkownika backend dopasowuje best-effort (mogą wyjść `null`,
 * gdy dopasowanie się nie powiedzie) — to tylko podpowiedź, użytkownik może je swobodnie zmienić.
 * Termin spłaty nieprefillowany, wylicza go backend po wyborze karty.
 */
export function mapLoanProposalToPurchaseDraft(proposal: LoanProposal): Purchase {
  const base = proposal.proposedPurchase;
  return {
    id: 0,
    idCard: base?.idCard ?? 0,
    idFirm: base?.idFirm ?? 0,
    idUser: base?.idUser ?? 0,
    name: base?.name || proposal.sourceSubject || '',
    purchaseDate: base?.purchaseDate ? new Date(base.purchaseDate) : new Date(),
    amount: base?.amount ?? 0,
    paymentDeadline: null,
    paymentDate: null,
    otherInfo: base?.otherInfo ?? '',
    paymentStatus: PaymentStatus.TO_PAY,
    idLoan: null,
  };
}
