package net.focik.homeoffice.finance.domain.card.port.primary;

import net.focik.homeoffice.finance.domain.card.Card;

public interface AddCardUseCase {
    Card addCard(Card card);
}
