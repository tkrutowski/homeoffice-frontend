package net.focik.homeoffice.finance.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotFoundException;

public class CardNotFoundException extends ObjectNotFoundException {
    public CardNotFoundException(String field, String message) {
        super(String.format("Nie znaleziono karty o %s: %s",field, message));
    }
    public CardNotFoundException(int id) {
        super(String.format("Nie znaleziono karty o id: %d",id));
    }
}
