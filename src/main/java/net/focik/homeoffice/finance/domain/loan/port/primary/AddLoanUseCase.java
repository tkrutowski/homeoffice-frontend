package net.focik.homeoffice.finance.domain.loan.port.primary;

import net.focik.homeoffice.finance.domain.loan.Loan;
import net.focik.homeoffice.finance.domain.loan.LoanInstallment;

public interface AddLoanUseCase {
    Loan addLoan(Loan loan);

    LoanInstallment addLoanInstallment(LoanInstallment loanInstallment);
}
