package net.focik.homeoffice.finance.domain.loan;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.finance.domain.loan.port.primary.AddLoanUseCase;
import net.focik.homeoffice.finance.domain.loan.port.primary.DeleteLoanUseCase;
import net.focik.homeoffice.finance.domain.loan.port.primary.GetLoanUseCase;
import net.focik.homeoffice.finance.domain.loan.port.primary.UpdateLoanUseCase;
import org.javamoney.moneta.Money;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor
@Component
public class LoanFacade implements AddLoanUseCase, GetLoanUseCase, UpdateLoanUseCase, DeleteLoanUseCase {

    LoanService loanService;

    @Override
    public Loan addLoan(Loan loan) {
        return loanService.saveLoan(loan);
    }

    @Override
    public LoanInstallment addLoanInstallment(LoanInstallment loanInstallment) {
        return loanService.addLoanInstallment(loanInstallment);
    }

    @Override
    public LoanInstallment getLoanInstallment(int idLoanInstallment) {
        return loanService.getLoanInstallment(idLoanInstallment);
    }

    @Override
    public Loan getLoanById(int idLoan, boolean withInstallment) {
        return loanService.findLoanById(idLoan, withInstallment);
    }

    @Override
    public List<Loan> getLoansByUser(int idEmployee, LoanStatus loanStatus, boolean withInstallment) {
        return loanService.findLoansByUser(idEmployee, loanStatus, withInstallment);
    }

    @Override
    public List<Loan> getLoansByUser(int idUser, boolean withInstallment) {
        return loanService.findLoansByUser(idUser, null, withInstallment);
    }

    @Override
    public List<Loan> getLoansByStatus(LoanStatus loanStatus, boolean withInstallment) {
        return loanService.findLoansByStatus(loanStatus, withInstallment);
    }

    @Override
    public List<LoanInstallment> getLoanInstallments(int idEmployee, LocalDate date) {
        return loanService.getLoanInstallments(idEmployee, date);
    }

    @Override
    public List<LoanInstallment> getLoanInstallments(int idLoan) {
        return loanService.findLoanById(idLoan, true).getLoanInstallments();
    }

    @Override
    public Loan updateLoan(Loan loan) {
        return loanService.saveLoan(loan);
    }

    @Override
    public LoanInstallment updateLoanInstallment(LoanInstallment loanInstallment) {
        return loanService.updateLoanInstallment(loanInstallment);
    }

    @Override
    public void updateLoanStatus(int idLoan, LoanStatus loanStatus) {
        Loan loan = loanService.findLoanById(idLoan, false);
        loan.changeLoanStatus(loanStatus);

        loanService.updateLoan(loan);
    }

    @Override
    public void deleteLoanById(int idLoan) {
        loanService.deleteLoan(idLoan);
    }

    @Override
    public void deleteLoanInstallmentById(int id) {
        loanService.deleteLoanInstallment(id);
    }

//
//    public Money getInstallmentLoansSumByIdUserAndDate(int idUser, LocalDate date) {
//        return loanService.getInstallmentLoansSumByIdEmployeeAndDate(idUser, date);
//    }
//
//    public Money getLoansToPaySum(Integer employeeId) {
//        return loanService.getLoansToPaySum(employeeId);
//    }
}
