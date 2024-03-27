package net.focik.homeoffice.finance.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotFoundException;

public class PurchaseNotFoundException extends ObjectNotFoundException {
    public PurchaseNotFoundException(Integer id) {
        super("Purchase with id = " + id + " does not exist");
    }
}
