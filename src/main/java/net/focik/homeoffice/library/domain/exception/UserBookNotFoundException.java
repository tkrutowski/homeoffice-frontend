package net.focik.homeoffice.library.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotFoundException;

public class UserBookNotFoundException extends ObjectNotFoundException {
    public UserBookNotFoundException(Integer id) {
        super("UserBook with id = " + id + " not found");
    }
}
