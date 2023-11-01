package net.focik.homeoffice.finance.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotFoundException;

public class BankNotFoundException extends ObjectNotFoundException {
    public BankNotFoundException(String field, String message) {
        super(String.format("Nie znaleziono banku o %s: %s",field, message));
    }

}
