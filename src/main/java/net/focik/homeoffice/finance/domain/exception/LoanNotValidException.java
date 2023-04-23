package net.focik.homeoffice.finance.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotValidException;

public class LoanNotValidException extends ObjectNotValidException {
    public LoanNotValidException(String message) {
        super(message);
    }

    public LoanNotValidException() {
        super("Loan variable can't be null or empty");
    }

}
