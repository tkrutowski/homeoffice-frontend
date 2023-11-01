package net.focik.homeoffice.finance.domain.loan.port.primary;

import net.focik.homeoffice.finance.domain.loan.Loan;
import net.focik.homeoffice.finance.domain.loan.LoanInstallment;
import net.focik.homeoffice.utils.share.PaymentStatus;

public interface UpdateLoanUseCase {
    Loan updateLoanStatus(int idLoan, PaymentStatus loanStatus);

    Loan updateLoan(Loan loan);

    LoanInstallment updateLoanInstallment(LoanInstallment loanInstallment);
}
