package net.focik.homeoffice.finance.api.mapper;

import net.focik.homeoffice.finance.api.dto.PurchaseDto;
import net.focik.homeoffice.finance.domain.exception.LoanNotValidException;
import net.focik.homeoffice.finance.domain.purchase.Purchase;
import net.focik.homeoffice.utils.share.PaymentStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class ApiPurchaseMapper {

    public Purchase toDomain(PurchaseDto dto) {
        valid(dto);
        return Purchase.builder()
                .id(dto.getId())
                .idCard(dto.getIdCard())
                .idFirm(dto.getIdFirm())
                .idUser(dto.getIdUser())
                .whatBought(dto.getWhatBought())
                .purchaseDate(LocalDate.parse(dto.getPurchaseDate()))
                .amount(BigDecimal.valueOf(Double.parseDouble(dto.getAmount())))
                .paymentDeadline(LocalDate.parse(dto.getPaymentDeadline()))
                .paymentDate(LocalDate.parse(dto.getPaymentDate()))
                .otherInfo(dto.getOtherInfo())
                .paymentStatus(PaymentStatus.valueOf(dto.getPaymentStatus()))
                .isInstallment(dto.isInstallment())
                .build();
    }

    public PurchaseDto toDto(Purchase card) {
        return PurchaseDto.builder()
                .id(card.getId())
                .idCard(card.getIdCard())
                .idFirm(card.getIdFirm())
                .idUser(card.getIdUser())
                .whatBought(card.getWhatBought())
                .purchaseDate(card.getPurchaseDate().toString())
                .amount(String.format("%.2f", card.getAmount()).replace(",", "."))
                .paymentDeadline(card.getPaymentDeadline().toString())
                .paymentDate(card.getPaymentDate().toString())
                .otherInfo(card.getOtherInfo() == null ? "" : card.getOtherInfo())
                .paymentStatus(card.getPaymentStatus().toString())
                .isInstallment(card.isInstallment())
                .build();
    }

    private void valid(PurchaseDto dto) {
        if (dto.getIdUser() == 0)
            throw new LoanNotValidException("IdUser can't be null.");
        if (dto.getPaymentDeadline().isEmpty())
            throw new LoanNotValidException("Date can't be empty.");
        if (dto.getPaymentDate().isEmpty())
            throw new LoanNotValidException("Date can't be empty.");
        if (dto.getAmount().isEmpty())
            throw new LoanNotValidException("Amount can't be empty.");
    }
}