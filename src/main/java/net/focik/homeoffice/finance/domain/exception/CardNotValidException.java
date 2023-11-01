package net.focik.homeoffice.finance.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotValidException;

public class CardNotValidException extends ObjectNotValidException {
    public CardNotValidException(String message) {
        super(message);
    }

    public CardNotValidException() {
        super("Card variable can't be null or empty");
    }

}
