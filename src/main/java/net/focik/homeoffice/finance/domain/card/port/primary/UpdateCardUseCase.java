package net.focik.homeoffice.finance.domain.card.port.primary;

import net.focik.homeoffice.finance.domain.card.Card;
import net.focik.homeoffice.utils.share.ActiveStatus;

public interface UpdateCardUseCase {
    void updateCardStatus(int idCard, ActiveStatus activeStatus);

    Card updateCard(Card card);
}
