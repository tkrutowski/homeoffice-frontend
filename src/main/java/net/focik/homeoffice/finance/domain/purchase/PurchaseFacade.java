package net.focik.homeoffice.finance.domain.purchase;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.finance.domain.purchase.port.primary.AddPurchaseUseCase;
import net.focik.homeoffice.finance.domain.purchase.port.primary.DeletePurchaseUseCase;
import net.focik.homeoffice.finance.domain.purchase.port.primary.GetPurchaseUseCase;
import net.focik.homeoffice.finance.domain.purchase.port.primary.UpdatePurchaseUseCase;
import net.focik.homeoffice.utils.share.PaymentStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@AllArgsConstructor
public class PurchaseFacade implements AddPurchaseUseCase, UpdatePurchaseUseCase, GetPurchaseUseCase, DeletePurchaseUseCase {

    private final PurchaseService purchaseService;

    @Override
    public Purchase addPurchase(Purchase purchase) {
        return purchaseService.addPurchase(purchase);
    }

    @Override
    public void updatePurchaseStatus(int idPurchase, PaymentStatus paymentStatus) {
        Purchase purchase = purchaseService.findPurchaseById(idPurchase);
        purchase.changePaymentStatus(paymentStatus);

        purchaseService.updatePurchase(purchase);
    }

    @Override
    public Purchase updatePurchase(Purchase purchase) {
        return purchaseService.updatePurchase(purchase);
    }

    @Override
    public void deletePurchase(int id) {
        purchaseService.deletePurchase(id);
    }

    @Override
    public Purchase findById(int id) {
        return purchaseService.findPurchaseById(id);
    }

    @Override
    public List<Purchase> findByUser(int idUser, PaymentStatus paymentStatus) {
        return purchaseService.findPurchasesByUser(idUser, paymentStatus);
    }
}
