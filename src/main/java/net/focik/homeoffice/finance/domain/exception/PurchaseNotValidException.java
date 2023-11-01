package net.focik.homeoffice.finance.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotValidException;

public class PurchaseNotValidException extends ObjectNotValidException {
    public PurchaseNotValidException(String message) {
        super(message);
    }

    public PurchaseNotValidException() {
        super("Purchase variable can't be null or empty");
    }

}
