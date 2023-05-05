package net.focik.homeoffice.finance.api.mapper;

import net.focik.homeoffice.finance.api.dto.FeeDto;
import net.focik.homeoffice.finance.api.dto.FeeInstallmentDto;
import net.focik.homeoffice.finance.domain.exception.LoanNotValidException;
import net.focik.homeoffice.finance.domain.fee.Fee;
import net.focik.homeoffice.finance.domain.fee.FeeFrequencyEnum;
import net.focik.homeoffice.finance.domain.fee.FeeInstallment;
import net.focik.homeoffice.utils.share.PaymentStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class ApiFeeMapper {

    public Fee toDomain(FeeDto dto) {
        valid(dto);
        return Fee.builder()
                .id(dto.getId())
                .idFirm(dto.getIdFirm())
                .idUser(dto.getIdUser())
                .name(dto.getName())
                .feeNumber(dto.getFeeNumber())
                .date(LocalDate.parse(dto.getDate()))
                .feeFrequency(FeeFrequencyEnum.valueOf(dto.getFeeFrequency()))
                .numberOfPayments(dto.getNumberOfPayments())
                .amount(BigDecimal.valueOf(Double.parseDouble(dto.getAmount())))
                .firstPaymentDate(LocalDate.parse(dto.getFirstPaymentDate()))
                .accountNumber(dto.getAccountNumber())
                .paymentStatus(PaymentStatus.valueOf(dto.getPaymentStatus()))
                .otherInfo(dto.getOtherInfo())
                .build();
    }

    public FeeDto toDto(Fee fee) {
        return FeeDto.builder()
                .id(fee.getId())
                .idFirm(fee.getIdFirm())
                .idUser(fee.getIdUser())
                .name(fee.getName())
                .feeNumber(fee.getFeeNumber())
                .date(fee.getDate().toString())
                .feeFrequency(fee.getFeeFrequency().getViewValue())
                .numberOfPayments(fee.getNumberOfPayments())
                .amount(String.format("%.2f", fee.getAmount()).replace(",", "."))
                .firstPaymentDate(fee.getFirstPaymentDate().toString())
                .accountNumber(fee.getAccountNumber())
                .paymentStatus(fee.getPaymentStatus().name())
                .otherInfo(fee.getOtherInfo() == null ? "" : fee.getOtherInfo())
                .installmentDtoList(fee.getFeeInstallments() != null ? fee.getFeeInstallments()
                        .stream().map(this::toDto).collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }

    public FeeInstallmentDto toDto(FeeInstallment fee) {
        return FeeInstallmentDto.builder()
                .idFeeInstallment(fee.getIdFeeInstallment())
                .idFee(fee.getIdFee())
                .installmentAmountToPay(String.format("%.2f", fee.getInstallmentAmountToPay()).replace(",", "."))
                .installmentAmountPaid(String.format("%.2f", fee.getInstallmentAmountPaid()).replace(",", "."))
                .paymentDeadline(fee.getPaymentDeadline().toString())
                .paymentDate(fee.getPaymentDate().toString())
                .paymentStatus(fee.getPaymentStatus().name())
                .build();
    }

    public FeeInstallment toDomain(FeeInstallmentDto dto) {
        valid(dto);
        return FeeInstallment.builder()
                .idFeeInstallment(dto.getIdFeeInstallment())
                .idFee(dto.getIdFee())
                .installmentAmountToPay(BigDecimal.valueOf(Double.parseDouble(dto.getInstallmentAmountToPay())))
                .installmentAmountPaid(BigDecimal.valueOf(Double.parseDouble(dto.getInstallmentAmountPaid())))
                .paymentDeadline(LocalDate.parse(dto.getPaymentDeadline()))
                .paymentDate(LocalDate.parse(dto.getPaymentDate()))
                .paymentStatus(PaymentStatus.valueOf(dto.getPaymentStatus()))
                .build();
    }

    private void valid(FeeDto dto) {
        if (dto.getIdUser() == 0)
            throw new LoanNotValidException("IdUser can't be null.");
        if (dto.getDate().isEmpty())
            throw new LoanNotValidException("Date can't be empty.");
    }

    private void valid(FeeInstallmentDto dto) {
        if (dto.getIdFee() == 0)
            throw new LoanNotValidException("IdFee can't be null.");
        if (dto.getPaymentDate().isEmpty())
            throw new LoanNotValidException("Date can't be empty.");
    }
}