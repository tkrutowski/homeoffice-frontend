package net.focik.homeoffice.finance.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectCanNotBeDeletedException;

public class FirmCanNotBeDeletedException extends ObjectCanNotBeDeletedException {
    public FirmCanNotBeDeletedException(String needToRemove) {
        super(String.format("Aby usunąć firmę musisz najpierw usunąć %s", needToRemove));
    }

}
