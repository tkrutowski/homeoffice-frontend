import type { Bank } from '@/features/finance/banks/types';
import type { Card } from '@/features/finance/cards/types';
import type { Loan, LoanInstallment } from '@/features/finance/loans/types';
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
