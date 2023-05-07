package net.focik.homeoffice.finance.domain.card.port.primary;

import net.focik.homeoffice.finance.domain.card.Card;
import net.focik.homeoffice.utils.share.ActiveStatus;

import java.util.List;

public interface GetCardUseCase {

    Card findById(int idCard);

    List<Card> findByUser(int idUser, ActiveStatus activeStatus);
}
