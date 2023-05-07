package net.focik.homeoffice.finance.api.mapper;

import net.focik.homeoffice.finance.api.dto.CardDto;
import net.focik.homeoffice.finance.domain.card.Card;
import net.focik.homeoffice.finance.domain.exception.LoanNotValidException;
import net.focik.homeoffice.utils.share.ActiveStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class ApiCardMapper {

    public Card toDomain(CardDto dto) {
        valid(dto);
        return Card.builder()
                .id(dto.getId())
                .idBank(dto.getIdBank())
                .idUser(dto.getIdUser())
                .name(dto.getName())
                .activationDate(LocalDate.parse(dto.getActivationDate()))
                .limit(BigDecimal.valueOf(Double.parseDouble(dto.getLimit())))
                .repaymentDay(dto.getRepaymentDay())
                .expirationDate(LocalDate.parse(dto.getExpirationDate()))
                .otherInfo(dto.getOtherInfo())
                .activeStatus(ActiveStatus.valueOf(dto.getActiveStatus()))
                .cardNumber(dto.getCardNumber())
                .closingDay(dto.getClosingDay())
                .build();
    }

    public CardDto toDto(Card card) {
        return CardDto.builder()
                .id(card.getId())
                .idBank(card.getIdBank())
                .idUser(card.getIdUser())
                .name(card.getName())
                .activationDate(card.getActivationDate().toString())
                .limit(String.format("%.2f", card.getLimit()).replace(",", "."))
                .repaymentDay(card.getRepaymentDay())
                .expirationDate(card.getExpirationDate().toString())
                .otherInfo(card.getOtherInfo() == null ? "" : card.getOtherInfo())
                .activeStatus(card.getActiveStatus().toString())
                .cardNumber(card.getCardNumber())
                .closingDay(card.getClosingDay())
                .build();
    }

    private void valid(CardDto dto) {
        if (dto.getIdUser() == 0)
            throw new LoanNotValidException("IdUser can't be null.");
        if (dto.getActivationDate().isEmpty())
            throw new LoanNotValidException("Date can't be empty.");
        if (dto.getExpirationDate().isEmpty())
            throw new LoanNotValidException("Date can't be empty.");
    }
}