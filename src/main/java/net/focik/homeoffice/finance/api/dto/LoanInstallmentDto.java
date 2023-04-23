package net.focik.homeoffice.finance.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class LoanInstallmentDto {
    private int idLoanInstallment;
    private int idLoan;
    private int installmentNumber;
    private String installmentAmountToPay;
    private String installmentAmountPaid;
    private String paymentDeadline;
    private String paymentDate;
    private String paymentStatus;
}