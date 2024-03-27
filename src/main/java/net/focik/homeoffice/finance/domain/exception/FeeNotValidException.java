package net.focik.homeoffice.finance.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotValidException;

public class FeeNotValidException extends ObjectNotValidException {
    public FeeNotValidException(String message) {
        super(message);
    }

    public FeeNotValidException() {
        super("Fee variable can't be null or empty");
    }

}
