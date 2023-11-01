package net.focik.homeoffice.finance.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotFoundException;

public class LoanInstallmentNotFoundException extends ObjectNotFoundException {
    public LoanInstallmentNotFoundException(Integer id) {
        super("Rata kredytu o ID = " + id + " nie istnieje");
    }
}
