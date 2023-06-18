package net.focik.homeoffice.finance.api.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.List;

@Builder
@Getter
@ToString
public class LoanDto {
    private int id;
    private BankDto bank;
    private int idUser;
    private String name;
    private String amount;
    private String date;
    private String loanNumber;
    private String accountNumber;
    private String firstPaymentDate;
    private int numberOfInstallments;
    private String installmentAmount;
    private String loanStatus;
    private String loanCost;//prowizja itp
    private String otherInfo;
    private String amountToPay;
    private List<LoanInstallmentDto> installmentDtoList;
}