package net.focik.homeoffice.finance.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectCanNotBeDeletedException;

public class BankCanNotBeDeletedException extends ObjectCanNotBeDeletedException {
    public BankCanNotBeDeletedException(String needToRemove) {
        super(String.format("Aby usunąć bank musisz najpierw usunąć %s", needToRemove));
    }

}
