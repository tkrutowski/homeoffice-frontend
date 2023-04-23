package net.focik.homeoffice.finance.domain.loan.port.primary;

import net.focik.homeoffice.finance.domain.loan.Loan;
import net.focik.homeoffice.finance.domain.loan.LoanInstallment;
import net.focik.homeoffice.finance.domain.loan.LoanStatus;

public interface UpdateLoanUseCase {
    void updateLoanStatus(int idLoan, LoanStatus loanStatus);

    Loan updateLoan(Loan loan);

    LoanInstallment updateLoanInstallment(LoanInstallment loanInstallment);
}
