package net.focik.homeoffice.finance.domain.purchase;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.finance.domain.card.Card;
import net.focik.homeoffice.finance.domain.exception.CardNotValidException;
import net.focik.homeoffice.finance.domain.exception.LoanNotFoundException;
import net.focik.homeoffice.finance.domain.exception.PurchaseNotValidException;
import net.focik.homeoffice.finance.domain.purchase.port.secondary.PurchaseRepository;
import net.focik.homeoffice.utils.share.ActiveStatus;
import net.focik.homeoffice.utils.share.PaymentStatus;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
class PurchaseService {

    private final PurchaseRepository purchaseRepository;

    Purchase addPurchase(Purchase purchase) {
        if (isNotValid(purchase))
            throw new CardNotValidException();
        return purchaseRepository.savePurchase(purchase);
    }

    List<Purchase> findPurchasesByUser(int idUser, PaymentStatus paymentStatus) {
        List<Purchase> purchaseByUserId = purchaseRepository.findPurchaseByUserId(idUser);

        if (paymentStatus == null)
            return purchaseByUserId;

        purchaseByUserId = purchaseByUserId.stream()
                .filter(card -> card.getPaymentStatus().equals(paymentStatus))
                .collect(Collectors.toList());

        return purchaseByUserId;
    }

    Purchase findPurchaseById(int idPurchase) {
        Optional<Purchase> purchaseById = purchaseRepository.findPurchaseById(idPurchase);

        if (purchaseById.isEmpty()) {
            throw new LoanNotFoundException(idPurchase);
        }

        return purchaseById.get();
    }

    @Transactional
    public void deletePurchase(int idPurchase) {
        //TODO sprawdzić czy nie ma ZAKUPÓW
        purchaseRepository.deletePurchaseById(idPurchase);
    }

    public Purchase updatePurchase(Purchase purchase) {
        if (isNotValid(purchase))
            throw new PurchaseNotValidException();
        return purchaseRepository.savePurchase(purchase);
    }

    private boolean isNotValid(Purchase purchase) {
        if (Objects.equals(purchase.getAmount(), BigDecimal.ZERO))
            return true;
        return purchase.getPurchaseDate() == null && purchase.getPaymentDeadline() == null && purchase.getPaymentDate() == null;
    }

}