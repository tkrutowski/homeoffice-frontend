package net.focik.homeoffice.finance.domain.card;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.addresses.domain.Address;
import net.focik.homeoffice.finance.domain.bank.Bank;
import net.focik.homeoffice.finance.domain.card.port.secondary.CardRepository;
import net.focik.homeoffice.finance.domain.exception.CardNotValidException;
import net.focik.homeoffice.finance.domain.exception.LoanNotFoundException;
import net.focik.homeoffice.finance.domain.exception.LoanNotValidException;
import net.focik.homeoffice.utils.share.ActiveStatus;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
class CardService {

    private final CardRepository cardRepository;

    Card addCard(Card card) {
        if (isNotValid(card))
            throw new CardNotValidException();
        return cardRepository.saveCard(card);
    }

    List<Card> findCardsByUser(int idUser, ActiveStatus activeStatus) {
        List<Card> cardByUserId = cardRepository.findCardByUserId(idUser);

        if (activeStatus == null)
            return cardByUserId;

        cardByUserId = cardByUserId.stream()
                .filter(card -> card.getActiveStatus().equals(activeStatus))
                .collect(Collectors.toList());

        return cardByUserId;
    }

    Card findCardById(int idCard) {
        Optional<Card> cardById = cardRepository.findCardById(idCard);

        if (cardById.isEmpty()) {
            throw new LoanNotFoundException(idCard);
        }

        return cardById.get();
    }

    @Transactional
    public void deleteCard(int idCard) {
        //TODO sprawdzić czy nie ma ZAKUPÓW
        cardRepository.deleteCardById(idCard);
    }

    public Card updateCard(Card card) {
        if (isNotValid(card))
            throw new CardNotValidException();
        return cardRepository.saveCard(card);
    }

    private boolean isNotValid(Card card) {
        if (Objects.equals(card.getLimit(), BigDecimal.ZERO))
            return true;
        return card.getActivationDate() == null && card.getExpirationDate() == null;
    }

}