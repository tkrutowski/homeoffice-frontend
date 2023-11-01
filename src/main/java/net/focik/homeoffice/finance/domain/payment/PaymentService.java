package net.focik.homeoffice.finance.domain.payment;

import net.focik.homeoffice.finance.domain.fee.Fee;
import net.focik.homeoffice.finance.domain.loan.Loan;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    Map<Integer, List<Payment>> getFinancialTransactionMap(LocalDate date, List<Fee> fees, List<Loan> loans) {
        Map<Integer, List<Payment>> resultMap;
        Collection<Payment> financialTransaction = new ArrayList<>();
        financialTransaction.addAll(findFinancialTransaction(fees, date));
        financialTransaction.addAll(findFinancialTransaction(loans, date));

        resultMap = financialTransaction.stream().collect(Collectors.groupingBy(Payment::getIdUser));
        return resultMap;
    }

    private Collection<Payment> findFinancialTransaction(List<? extends FinancialTransaction> fc, LocalDate date) {
        return fc.stream()
                .map(FinancialTransaction::getPayment)
                .filter(payment -> checkInstallments(payment.getInstallments(), date))
                .collect(Collectors.toList());
    }

    private boolean checkInstallments(List<? extends Installment> installments, LocalDate date) {
        return installments.stream()
                .anyMatch(installment -> installment.getDeadLineDate().getYear() == date.getYear());
    }
}
