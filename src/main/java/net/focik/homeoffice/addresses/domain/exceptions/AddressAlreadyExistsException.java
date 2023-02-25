package net.focik.homeoffice.addresses.domain.exceptions;

import net.focik.homeoffice.utils.exceptions.ObjectAlreadyExistException;

public class AddressAlreadyExistsException extends ObjectAlreadyExistException {
    public AddressAlreadyExistsException(Integer id) {
        super("Address with id: " + id + " already exists.");
    }
}
