package net.focik.homeoffice.finance.domain.fee;

import lombok.*;
import net.focik.homeoffice.finance.domain.firm.Firm;
import net.focik.homeoffice.utils.share.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class Fee {

    private int id;
    private Firm firm;
    private int idUser;
    private String name;
    private String feeNumber;
    private LocalDate date;
    private FeeFrequencyEnum feeFrequency;
    private Integer numberOfPayments;//ile razy pobrać
    private BigDecimal amount;
    private LocalDate firstPaymentDate;
    private String accountNumber;
    private PaymentStatus feeStatus;
    private String otherInfo;
    private List<FeeInstallment> feeInstallments;

    public void addFeeInstallment(List<FeeInstallment> feeInstallments) {
        this.feeInstallments = feeInstallments;
    }

    public void changeFeeStatus(PaymentStatus feeStatus) {
        this.feeStatus = feeStatus;
    }

}