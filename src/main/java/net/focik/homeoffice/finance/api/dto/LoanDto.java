package net.focik.homeoffice.finance.api.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;

@Builder
@Getter
@ToString
public class LoanDto {
    private int id;
    private BankDto bank;
    private int idUser;
    private String name;
    private Number amount;
    private LocalDate date;
    private String loanNumber;
    private String accountNumber;
    private LocalDate firstPaymentDate;
    private int numberOfInstallments;
    private Number installmentAmount;
    private PaymentStatusDto loanStatus;
    private Number loanCost;//prowizja itp
    private String otherInfo;
    private String amountToPay;
    private List<LoanInstallmentDto> installmentList;
}