package net.focik.homeoffice.finance.infrastructure.mapper;

import net.focik.homeoffice.finance.domain.fee.Fee;
import net.focik.homeoffice.finance.domain.fee.FeeInstallment;
import net.focik.homeoffice.finance.infrastructure.dto.FeeDbDto;
import net.focik.homeoffice.finance.infrastructure.dto.FeeInstallmentDbDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class JpaFeeMapper {

    public FeeDbDto toDto(Fee fee) {
        return FeeDbDto.builder()
                .id(fee.getId())
                .idFirm(fee.getIdFirm())
                .idUser(fee.getIdUser())
                .name(fee.getName())
                .feeNumber(fee.getFeeNumber())
                .date(fee.getDate())
                .feeFrequencyEnum(fee.getFeeFrequency())
                .numberOfPayments(fee.getNumberOfPayments())
                .amount(fee.getAmount())
                .firstPaymentDate(fee.getFirstPaymentDate())
                .accountNumber(fee.getAccountNumber())
                .otherInfo(fee.getOtherInfo())
                .paymentStatus(fee.getPaymentStatus())
                .build();
    }

    public Fee toDomain(FeeDbDto dto, List<FeeInstallmentDbDto> feeInstallments) {
        return Fee.builder()
                .id(dto.getId())
                .idFirm(dto.getIdFirm())
                .idUser(dto.getIdUser())
                .name(dto.getName())
                .feeNumber(dto.getFeeNumber())
                .date(dto.getDate())
                .feeFrequency(dto.getFeeFrequencyEnum())
                .numberOfPayments(dto.getNumberOfPayments())
                .amount(dto.getAmount())
                .firstPaymentDate(dto.getFirstPaymentDate())
                .accountNumber(dto.getAccountNumber())
                .paymentStatus(dto.getPaymentStatus())
                .otherInfo(dto.getOtherInfo())
                .feeInstallments(mapListFeeInstallmentToSet(feeInstallments))
                .build();
    }

    public Fee toDomain(FeeDbDto dto) {
        return Fee.builder()
                .id(dto.getId())
                .idFirm(dto.getIdFirm())
                .idUser(dto.getIdUser())
                .name(dto.getName())
                .feeNumber(dto.getFeeNumber())
                .date(dto.getDate())
                .feeFrequency(dto.getFeeFrequencyEnum())
                .numberOfPayments(dto.getNumberOfPayments())
                .amount(dto.getAmount())
                .firstPaymentDate(dto.getFirstPaymentDate())
                .accountNumber(dto.getAccountNumber())
                .paymentStatus(dto.getPaymentStatus())
                .otherInfo(dto.getOtherInfo())
                .build();
    }

    private List<FeeInstallment> mapListFeeInstallmentToSet(List<FeeInstallmentDbDto> installmentDtoList) {
        List<FeeInstallment> feeInstallmentSet = new ArrayList<>();

        installmentDtoList.stream()
                .map(this::toDomain)
                .forEach(feeInstallmentSet::add);

        return feeInstallmentSet;
    }

    public FeeInstallmentDbDto toDto(FeeInstallment feeInstallment) {
        return FeeInstallmentDbDto.builder()
                .id(feeInstallment.getIdFeeInstallment())
                .idFee(feeInstallment.getIdFee())
                .installmentAmountToPay(feeInstallment.getInstallmentAmountToPay())
                .installmentAmountPaid(feeInstallment.getInstallmentAmountPaid())
                .paymentDeadline(feeInstallment.getPaymentDeadline())
                .paymentDate(feeInstallment.getPaymentDate())
                .paymentStatus(feeInstallment.getPaymentStatus())
                .build();
    }

    public FeeInstallment toDomain(FeeInstallmentDbDto dto) {
        return FeeInstallment.builder()
                .idFeeInstallment(dto.getId())
                .idFee(dto.getIdFee())
                .installmentAmountToPay(dto.getInstallmentAmountToPay())
                .installmentAmountPaid(dto.getInstallmentAmountPaid())
                .paymentDeadline(dto.getPaymentDeadline())
                .paymentDate(dto.getPaymentDate())
                .paymentStatus(dto.getPaymentStatus())
                .build();
    }
}
