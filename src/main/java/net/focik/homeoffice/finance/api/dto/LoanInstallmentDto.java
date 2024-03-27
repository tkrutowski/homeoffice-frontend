package net.focik.homeoffice.finance.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class LoanInstallmentDto implements InstallmentDto {
    private int idLoanInstallment;
    private int idLoan;
    private int installmentNumber;
    private Number installmentAmountToPay;
    private Number installmentAmountPaid;
    private LocalDate paymentDeadline;
    private LocalDate paymentDate;
    private PaymentStatusDto paymentStatus;
}