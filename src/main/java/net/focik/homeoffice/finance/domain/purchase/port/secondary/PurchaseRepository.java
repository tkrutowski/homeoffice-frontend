package net.focik.homeoffice.finance.domain.purchase.port.secondary;

import net.focik.homeoffice.finance.domain.card.Card;
import net.focik.homeoffice.finance.domain.purchase.Purchase;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public interface PurchaseRepository {
    Purchase savePurchase(Purchase card);

    Optional<Purchase> findPurchaseById(Integer id);

    List<Purchase> findPurchaseByUserId(Integer idUser);

    List<Purchase> findAll();

    void deletePurchaseById(int idCard);

}
