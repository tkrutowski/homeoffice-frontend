package net.focik.homeoffice.finance.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotFoundException;

public class FeeNotFoundException extends ObjectNotFoundException {
    public FeeNotFoundException(Integer id) {
        super("Fee with id = " + id + " does not exist");
    }
}
