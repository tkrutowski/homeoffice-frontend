package net.focik.homeoffice.finance.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectAlreadyExistException;

public class BankAlreadyExistException extends ObjectAlreadyExistException {
    public BankAlreadyExistException(String message) {
        super(message);
    }
}
