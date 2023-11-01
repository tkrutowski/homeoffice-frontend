package net.focik.homeoffice.finance.domain.purchase.port.primary;

import net.focik.homeoffice.finance.domain.purchase.Purchase;

public interface AddPurchaseUseCase {
    Purchase addPurchase(Purchase purchase);
}
