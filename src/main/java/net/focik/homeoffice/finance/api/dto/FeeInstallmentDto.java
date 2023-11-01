package net.focik.homeoffice.finance.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class FeeInstallmentDto {
    private int idFeeInstallment;
    private int idFee;
    private String installmentAmountToPay;
    private String installmentAmountPaid;
    private String paymentDeadline;
    private String paymentDate;
    private String paymentStatus;
}