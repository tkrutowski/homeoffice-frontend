package net.focik.homeoffice.finance.domain.card;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.finance.domain.bank.Bank;
import net.focik.homeoffice.finance.domain.card.port.primary.AddCardUseCase;
import net.focik.homeoffice.finance.domain.card.port.primary.DeleteCardUseCase;
import net.focik.homeoffice.finance.domain.card.port.primary.GetCardUseCase;
import net.focik.homeoffice.finance.domain.card.port.primary.UpdateCardUseCase;
import net.focik.homeoffice.finance.domain.loan.Loan;
import net.focik.homeoffice.utils.share.ActiveStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@AllArgsConstructor
public class CardFacade implements AddCardUseCase, UpdateCardUseCase, GetCardUseCase, DeleteCardUseCase {

    private final CardService cardService;

    @Override
    public Card addCard(Card card) {
        return cardService.addCard(card);
    }

    @Override
    public void updateCardStatus(int idCard, ActiveStatus activeStatus) {
        Card card = cardService.findCardById(idCard);
        card.changeActiveStatus(activeStatus);

        cardService.updateCard(card);
    }

    @Override
    public Card updateCard(Card card) {
        return cardService.updateCard(card);
    }

    @Override
    public void deleteCard(int id) {
        cardService.deleteCard(id);
    }

    @Override
    public Card findById(int id) {
        return cardService.findCardById(id);
    }

    @Override
    public List<Card> findByUser(int idUser, ActiveStatus activeStatus) {
        return cardService.findCardsByUser(idUser, activeStatus);
    }
}
