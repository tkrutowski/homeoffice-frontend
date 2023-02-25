package net.focik.homeoffice.addresses.domain.exceptions;

import net.focik.homeoffice.utils.exceptions.ObjectNotValidException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value= HttpStatus.BAD_REQUEST)
public class AddressNotValidException extends ObjectNotValidException {
    public AddressNotValidException(String message) {
        super(message);
    }
}
