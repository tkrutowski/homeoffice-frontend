package net.focik.homeoffice.finance.domain.loan.port.secondary;

import net.focik.homeoffice.finance.domain.loan.Loan;
import net.focik.homeoffice.finance.domain.loan.LoanInstallment;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
public interface LoanRepository {
    Loan saveLoan(Loan loan);

    LoanInstallment saveLoanInstallment(LoanInstallment loanInstallment);

    Optional<Loan> findLoanById(Integer id);

    Optional<LoanInstallment> findLoanInstallmentById(Integer id);

    List<Loan> findLoanByUserId(Integer idEmployee);

    List<Loan> findAll();

    List<LoanInstallment> findLoanInstallmentByUserIdAndDate(Integer employeeId, LocalDate date);

    List<LoanInstallment> findLoanInstallmentByLoanId(Integer loanId);

    void deleteLoanById(int idLoan);

    void deleteLoanInstallmentById(int idLoanInstallment);

    void deleteLoanInstallmentByIdLoan(int idLoan);
}
