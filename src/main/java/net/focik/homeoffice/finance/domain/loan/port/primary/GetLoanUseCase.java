package net.focik.homeoffice.finance.domain.loan.port.primary;

import net.focik.homeoffice.finance.domain.loan.Loan;
import net.focik.homeoffice.finance.domain.loan.LoanInstallment;
import net.focik.homeoffice.finance.domain.loan.LoanStatus;

import java.time.LocalDate;
import java.util.List;

public interface GetLoanUseCase {

    Loan getLoanById(int idLoan, boolean withInstallment);

    List<Loan> getLoansByStatus(LoanStatus loanStatus, boolean withInstallment);

    List<Loan> getLoansByUser(int idUser, boolean withInstallment);

    List<Loan> getLoansByUser(int idUser, LoanStatus loanStatus, boolean withInstallment);

    LoanInstallment getLoanInstallment(int idLoanInstallment);

    List<LoanInstallment> getLoanInstallments(int idUser, LocalDate date);

    List<LoanInstallment> getLoanInstallments(int idLoan);
}
