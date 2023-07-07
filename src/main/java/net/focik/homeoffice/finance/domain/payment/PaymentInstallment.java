package net.focik.homeoffice.finance.domain.payment;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import net.focik.homeoffice.utils.share.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
@Getter
@ToString
public class PaymentInstallment {
    private int idLoanInstallment;
    private int idLoan;
    private int installmentNumber;
    private BigDecimal installmentAmountToPay;
    private BigDecimal installmentAmountPaid;
    private LocalDate paymentDeadline;
    private LocalDate paymentDate;
    private PaymentStatus paymentStatus;
}
