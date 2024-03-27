package net.focik.homeoffice.finance.api.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;

@Builder
@Getter
@ToString
public class FeeDto {
    private int id;
    private FirmDto firm;
    private int idUser;
    private String name;
    private String feeNumber;
    private LocalDate date;
    private FeeFrequencyDto feeFrequency;
    private Integer numberOfPayments;//ile razy pobrać
    private Number amount;
    private LocalDate firstPaymentDate;
    private String accountNumber;
    private PaymentStatusDto feeStatus;
    private String otherInfo;
    private List<FeeInstallmentDto> installmentList;
}