package net.focik.homeoffice.addresses.domain.exceptions;

import net.focik.homeoffice.utils.exceptions.ObjectNotFoundException;

public class AddressNotFoundException extends ObjectNotFoundException{
    public AddressNotFoundException(Integer id) {
        super("Address with id = " + id + " does not exist");
    }
}
