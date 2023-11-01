package net.focik.homeoffice.finance.domain.purchase.port.primary;

import net.focik.homeoffice.finance.domain.purchase.Purchase;
import net.focik.homeoffice.utils.share.PaymentStatus;

public interface UpdatePurchaseUseCase {
    Purchase updatePurchaseStatus(int idPurchase, PaymentStatus paymentStatus);

    Purchase updatePurchase(Purchase purchase);
}
