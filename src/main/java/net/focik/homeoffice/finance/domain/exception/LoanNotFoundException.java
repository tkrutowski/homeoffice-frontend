package net.focik.homeoffice.finance.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotFoundException;

public class LoanNotFoundException extends ObjectNotFoundException {
    public LoanNotFoundException(Integer id) {
        super("Loan with id = " + id + " does not exist");
    }
}
