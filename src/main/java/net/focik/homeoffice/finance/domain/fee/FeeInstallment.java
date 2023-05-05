package net.focik.homeoffice.finance.domain.fee;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import net.focik.homeoffice.utils.share.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
@Getter
@ToString
public class FeeInstallment {
    private int idFeeInstallment;
    private int idFee;
    private BigDecimal installmentAmountToPay;
    private BigDecimal installmentAmountPaid;
    private LocalDate paymentDeadline;
    private LocalDate paymentDate;
    private PaymentStatus paymentStatus;
}
