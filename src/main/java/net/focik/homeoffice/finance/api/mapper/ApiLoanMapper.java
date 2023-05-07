package net.focik.homeoffice.finance.api.mapper;

import net.focik.homeoffice.finance.api.dto.LoanDto;
import net.focik.homeoffice.finance.api.dto.LoanInstallmentDto;
import net.focik.homeoffice.finance.domain.exception.LoanNotValidException;
import net.focik.homeoffice.finance.domain.loan.Loan;
import net.focik.homeoffice.finance.domain.loan.LoanInstallment;
import net.focik.homeoffice.utils.share.PaymentStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class ApiLoanMapper {

    public Loan toDomain(LoanDto dto) {
        valid(dto);
        return Loan.builder()
                .id(dto.getId())
                .idBank(dto.getIdBank())
                .idUser(dto.getIdUser())
                .name(dto.getName())
                .amount(BigDecimal.valueOf(Double.parseDouble(dto.getAmount())))
                .date(LocalDate.parse(dto.getDate()))
                .loanNumber(dto.getLoanNumber())
                .accountNumber(dto.getAccountNumber())
                .firstPaymentDate(LocalDate.parse(dto.getFirstPaymentDate()))
                .numberOfInstallments(dto.getNumberOfInstallments())
                .installmentAmount(BigDecimal.valueOf(Double.parseDouble(dto.getInstallmentAmount())))
                .loanStatus(PaymentStatus.valueOf(dto.getLoanStatus()))
                .otherInfo(dto.getOtherInfo())
                .loanCost(BigDecimal.valueOf(Double.parseDouble(dto.getLoanCost())))
                .build();
    }

    public LoanDto toDto(Loan l) {
        return LoanDto.builder()
                .id(l.getId())
                .idBank(l.getIdBank())
                .idUser(l.getIdUser())
                .name(l.getName())
                .amount(String.format("%.2f", l.getAmount()).replace(",", "."))
                .date(l.getDate().toString())
                .loanNumber(l.getLoanNumber())
                .accountNumber(l.getAccountNumber())
                .firstPaymentDate(l.getFirstPaymentDate().toString())
                .numberOfInstallments(l.getNumberOfInstallments())
                .installmentAmount(String.format("%.2f", l.getInstallmentAmount()).replace(",", "."))
                .loanStatus(l.getLoanStatus().name())
                .loanCost(String.format("%.2f", l.getLoanCost()).replace(",", "."))
                .otherInfo(l.getOtherInfo() == null ? "" : l.getOtherInfo())
                .installmentDtoList(l.getLoanInstallments() != null ? l.getLoanInstallments()
                        .stream().map(this::toDto).collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }

    public LoanInstallmentDto toDto(LoanInstallment l) {
        return LoanInstallmentDto.builder()
                .idLoanInstallment(l.getIdLoanInstallment())
                .idLoan(l.getIdLoan())
                .installmentNumber(l.getInstallmentNumber())
                .installmentAmountToPay(String.format("%.2f", l.getInstallmentAmountToPay()).replace(",", "."))
                .installmentAmountPaid(String.format("%.2f", l.getInstallmentAmountPaid()).replace(",", "."))
                .paymentDeadline(l.getPaymentDeadline().toString())
                .paymentDate(l.getPaymentDate().toString())
                .paymentStatus(l.getPaymentStatus().name())
                .build();
    }

    public LoanInstallment toDomain(LoanInstallmentDto dto) {
        valid(dto);
        return LoanInstallment.builder()
                .idLoanInstallment(dto.getIdLoanInstallment())
                .idLoan(dto.getIdLoan())
                .installmentNumber(dto.getInstallmentNumber())
                .installmentAmountToPay(BigDecimal.valueOf(Double.parseDouble(dto.getInstallmentAmountToPay())))
                .installmentAmountPaid(BigDecimal.valueOf(Double.parseDouble(dto.getInstallmentAmountPaid())))
                .paymentStatus(PaymentStatus.valueOf(dto.getPaymentStatus()))
                .build();
    }

    private void valid(LoanDto dto) {
        if (dto.getIdUser() == 0)
            throw new LoanNotValidException("IdUser can't be null.");
        if (dto.getDate().isEmpty())
            throw new LoanNotValidException("Date can't be empty.");
    }

    private void valid(LoanInstallmentDto dto) {
        if (dto.getIdLoan() == 0)
            throw new LoanNotValidException("IdLoan can't be null.");
        if (dto.getPaymentDate().isEmpty())
            throw new LoanNotValidException("Date can't be empty.");
    }
}