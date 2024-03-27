package net.focik.homeoffice.finance.api.mapper;

import net.focik.homeoffice.finance.api.dto.PaymentStatusDto;
import net.focik.homeoffice.finance.api.dto.PurchaseDto;
import net.focik.homeoffice.finance.domain.exception.LoanNotValidException;
import net.focik.homeoffice.finance.domain.purchase.Purchase;
import net.focik.homeoffice.utils.share.PaymentStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Component
public class ApiPurchaseMapper {

    public Purchase toDomain(PurchaseDto dto) {
        valid(dto);
        return Purchase.builder()
                .id(dto.getId())
                .idCard(dto.getIdCard())
                .idFirm(dto.getIdFirm())
                .idUser(dto.getIdUser())
                .name(dto.getName())
                .purchaseDate(LocalDate.parse(dto.getPurchaseDate()))
                .amount(BigDecimal.valueOf(Double.parseDouble(dto.getAmount())))
                .paymentDeadline(LocalDate.parse(dto.getPaymentDeadline()))
                .paymentDate(LocalDate.parse(dto.getPaymentDate()))
                .otherInfo(dto.getOtherInfo())
                .paymentStatus(PaymentStatus.valueOf(dto.getPaymentStatus().getName()))
                .isInstallment(dto.isInstallment())
                .build();
    }

    public PurchaseDto toDto(Purchase purchase) {
        return PurchaseDto.builder()
                .id(purchase.getId())
                .idCard(purchase.getIdCard())
                .idFirm(purchase.getIdFirm())
                .idUser(purchase.getIdUser())
                .name(purchase.getName())
                .purchaseDate(purchase.getPurchaseDate().toString())
                .amount(String.format("%.2f", purchase.getAmount()).replace(",", "."))
                .paymentDeadline(purchase.getPaymentDeadline().toString())
                .paymentDate(purchase.getPaymentDate().toString())
                .otherInfo(purchase.getOtherInfo() == null ? "" : purchase.getOtherInfo())
                .paymentStatus(new PaymentStatusDto(purchase.getPaymentStatus().toString(), purchase.getPaymentStatus().getViewValue()))
                .isInstallment(purchase.isInstallment())
                .build();
    }

    public Map<String, List<PurchaseDto>> toDto(Map<LocalDate, List<Purchase>> inputMap){
        Map<String, List<PurchaseDto>> outputMap = new TreeMap<>();

        for (Map.Entry<LocalDate, List<Purchase>> entry : inputMap.entrySet()) {
            outputMap.put(entry.getKey().toString(), entry.getValue().stream()
                    .map(this::toDto)
                    .collect(Collectors.toList()));

        }
        return outputMap;
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