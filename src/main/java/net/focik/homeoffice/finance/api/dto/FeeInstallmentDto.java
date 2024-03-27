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
public class FeeInstallmentDto implements InstallmentDto {
    private int idFeeInstallment;
    private int idFee;
    private Number installmentAmountToPay;
    private Number installmentAmountPaid;
    private LocalDate paymentDeadline;
    private LocalDate paymentDate;
    private PaymentStatusDto paymentStatus;
}