package net.focik.homeoffice.finance.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotFoundException;

public class FirmNotFoundException extends ObjectNotFoundException {
    public FirmNotFoundException(String field, String message) {
        super(String.format("Nie znaleziono firmy o %s: %s",field, message));
    }

}
