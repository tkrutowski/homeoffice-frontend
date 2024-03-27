package net.focik.homeoffice.finance.domain.purchase;

import lombok.*;
import net.focik.homeoffice.utils.share.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class Purchase {

    private int id;
    private int idCard;
    private int idFirm;
    private int idUser;
    private String name;
    private LocalDate purchaseDate;
    private BigDecimal amount;
    private LocalDate paymentDeadline;
    private LocalDate paymentDate;
    private String otherInfo;
    private PaymentStatus paymentStatus;
    private boolean isInstallment;

    public void changePaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
        if(paymentStatus.equals(PaymentStatus.PAID)){
            paymentDate=LocalDate.now();
        } else if (paymentStatus.equals(PaymentStatus.TO_PAY)) {
            paymentDate=LocalDate.MIN;
        }
    }
}