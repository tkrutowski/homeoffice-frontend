package net.focik.homeoffice.finance.api.mapper;

import lombok.RequiredArgsConstructor;
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
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ApiLoanMapper {

    private final ApiBankMapper bankMapper;

    public Loan toDomain(LoanDto dto) {
        valid(dto);
        return Loan.builder()
                .id(dto.getId())
                .bank(bankMapper.toDomain(dto.getBank()))
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
                .bank(bankMapper.toDto(l.getBank()))
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
                .amountToPay(getAmountToPay(l.getLoanInstallments()))
                .build();
    }

    private String getAmountToPay(List<LoanInstallment> loanInstallments) {
        if (loanInstallments != null) {
            BigDecimal reduce = loanInstallments.stream()
//                    .filter(loanInstallment -> loanInstallment.getPaymentStatus() == PaymentStatus.TO_PAY)
                    .filter(loanInstallment -> PaymentStatus.TO_PAY.equals(loanInstallment.getPaymentStatus()))
                    .map(LoanInstallment::getInstallmentAmountToPay)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            long count = loanInstallments.stream()
                    .filter(loanInstallment -> loanInstallment.getPaymentStatus() == PaymentStatus.TO_PAY)
                    .count();
            return String.format("%.2f (%d)", reduce, count);
        }
        return "??? (?)";
    }

    public LoanInstallmentDto toDto(LoanInstallment l) {
        return LoanInstallmentDto.builder()
                .idLoanInstallment(l.getIdLoanInstallment())
                .idLoan(l.getIdLoan())
                .installmentNumber(l.getInstallmentNumber())
                .installmentAmountToPay(String.format("%.2f", l.getInstallmentAmountToPay()).replace(",", "."))
                .installmentAmountPaid(String.format("%.2f", l.getInstallmentAmountPaid()).replace(",", "."))
                .paymentDeadline(l.getPaymentDeadline().toString())
                .paymentDate(l.getPaymentDate() != null ? l.getPaymentDate().toString() : "")
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
        if (dto.getDate().isEmpty() || dto.getFirstPaymentDate().isEmpty())
            throw new LoanNotValidException("Date can't be empty.");
    }

    private void valid(LoanInstallmentDto dto) {
        if (dto.getIdLoan() == 0)
            throw new LoanNotValidException("IdLoan can't be null.");
        if (dto.getPaymentDate().isEmpty())
            throw new LoanNotValidException("Date can't be empty.");
    }
}