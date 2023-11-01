package net.focik.homeoffice.finance.api.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

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
    private String date;
    private String feeFrequency;
    private Integer numberOfPayments;//ile razy pobrać
    private String amount;
    private String firstPaymentDate;
    private String accountNumber;
    private String feeStatus;
    private String otherInfo;
    private List<FeeInstallmentDto> installmentDtoList;
}