package net.focik.homeoffice.finance.domain.loan;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.finance.domain.exception.LoanInstallmentNotFoundException;
import net.focik.homeoffice.finance.domain.exception.LoanNotFoundException;
import net.focik.homeoffice.finance.domain.exception.LoanNotValidException;
import net.focik.homeoffice.finance.domain.loan.port.secondary.LoanRepository;
import org.javamoney.moneta.Money;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
class LoanService {

    private final LoanRepository loanRepository;

    //-----------------------------LOAN---------------------------


    Loan saveLoan(Loan loan) {
        if (isNotValid(loan))
            throw new LoanNotValidException();
        return loanRepository.saveLoan(loan);
    }

    public LoanInstallment addLoanInstallment(LoanInstallment loanInstallment) {
        return loanRepository.saveLoanInstallment(loanInstallment);
    }

    Money getInstallmentLoansSumByIdEmployeeAndDate(int idEmployee, LocalDate date) {
        Money sum = Money.of(0, "PLN");
        List<LoanInstallment> byIdEmployeeAndDate = loanRepository.findLoanInstallmentByUserIdAndDate(idEmployee, date);

        if (byIdEmployeeAndDate != null && !byIdEmployeeAndDate.isEmpty()) {
            for (LoanInstallment installment : byIdEmployeeAndDate) {
                sum = sum.add(Money.of(installment.getInstallmentAmountToPay(), "PLN"));
            }
        }
        return sum;
    }

    List<Loan> findLoansByUser(int idUser, LoanStatus loanStatus, boolean withLoanInstallment) {
        List<Loan> loanByUserId = loanRepository.findLoanByUserId(idUser);

        if (withLoanInstallment) {
            for (Loan l : loanByUserId) {
                List<LoanInstallment> loanInstallmentList = findLoanInstallmentByLoanId(l.getId());
                l.addLoanInstallment(loanInstallmentList);
            }
        }

        if (loanStatus == null)
            return loanByUserId;

        loanByUserId = loanByUserId.stream()
                .filter(loan -> loan.getLoanStatus().equals(loanStatus))
                .collect(Collectors.toList());


        return loanByUserId;
    }

    List<LoanInstallment> findLoanInstallmentByLoanId(int idLoan) {
        return loanRepository.findLoanInstallmentByLoanId(idLoan);
    }

    List<LoanInstallment> getLoanInstallments(Integer idEmployee, LocalDate date) {
        List<Loan> loansByEmployee = findLoansByUser(idEmployee, null, true);
        return loansByEmployee.stream()
                .map(Loan::getLoanInstallments)
                .flatMap(Collection::stream)
                .filter(loanInstallment -> loanInstallment.getPaymentDeadline().getYear() == (date.getYear()))
                .filter(loanInstallment -> loanInstallment.getPaymentDeadline().getMonth().equals(date.getMonth()))
                .collect(Collectors.toList());
    }

    Loan findLoanById(int idLoan, boolean withLoanInstallment) {
        Optional<Loan> loanById = loanRepository.findLoanById(idLoan);

        if (loanById.isEmpty()) {
            throw new LoanNotFoundException(idLoan);
        }

        if (withLoanInstallment) {
            List<LoanInstallment> loanInstallmentList = findLoanInstallmentByLoanId(loanById.get().getId());
            loanById.get().addLoanInstallment(loanInstallmentList);
        }

        return loanById.get();
    }

    List<Loan> findLoansByStatus(LoanStatus loanStatus, boolean withInstallment) {
        List<Loan> loans = loanRepository.findAll();

        if (withInstallment) {
            for (Loan l : loans) {
                List<LoanInstallment> loanInstallmentList = findLoanInstallmentByLoanId(l.getId());
                l.addLoanInstallment(loanInstallmentList);
            }
        }

        if (loanStatus == null || LoanStatus.ALL.equals(loanStatus))
            return loans;

        loans = loans.stream()
                .filter(loan -> loan.getLoanStatus().equals(loanStatus))
                .collect(Collectors.toList());

        return loans;
    }

    @Transactional
    public void deleteLoan(int idLoan) {
        loanRepository.deleteLoanInstallmentByIdLoan(idLoan);
        loanRepository.deleteLoanById(idLoan);
    }

    public void updateLoan(Loan loan) {
        if (isNotValid(loan))
            throw new LoanNotValidException();
        loanRepository.saveLoan(loan);
    }

    public LoanInstallment updateLoanInstallment(LoanInstallment loanInstallment) {
        if (isNotValid(loanInstallment))
            throw new LoanNotValidException();
        return loanRepository.saveLoanInstallment(loanInstallment);
    }

    public void deleteLoanInstallment(int id) {
        loanRepository.deleteLoanInstallmentById(id);
    }

    private boolean isNotValid(Loan a) {
        if (Objects.equals(a.getAmount(), BigDecimal.ZERO))
            return true;
        if (Objects.equals(a.getInstallmentAmount(), BigDecimal.ZERO))
            return true;
        return a.getDate() == null;
    }

    private boolean isNotValid(LoanInstallment loanInstallment) {
        if (Objects.equals(loanInstallment.getInstallmentAmountPaid(), BigDecimal.ZERO))
            return true;
        return loanInstallment.getPaymentDate() == null;
    }

    public Money getLoansToPaySum(Integer idUser) {
        List<Loan> loans = findLoansByUser(idUser, LoanStatus.TO_PAY, true);
        Money result = Money.of(BigDecimal.ZERO, "PLN");

        for (Loan loan : loans) {
            Money loanAmount = mapToMoney(loan.getAmount());
            BigDecimal reduce = loan.getLoanInstallments().stream()
                    .map(LoanInstallment::getInstallmentAmountToPay)
                    .reduce(BigDecimal::add)
                    .orElse(BigDecimal.ZERO);
            Money loanInstallmentPayedOff = Money.of(reduce, "PLN");
            result = result.add(loanAmount.subtract(loanInstallmentPayedOff));
        }

        return result;
    }

    private Money mapToMoney(Number amount) {
        return Money.of(amount, "PLN");
    }

    public LoanInstallment getLoanInstallment(int idLoanInstallment) {
        Optional<LoanInstallment> loanInstallmentById = loanRepository.findLoanInstallmentById(idLoanInstallment);

        if (loanInstallmentById.isEmpty()){
            throw new LoanInstallmentNotFoundException(idLoanInstallment);
        }
        return loanInstallmentById.get();
    }
}
