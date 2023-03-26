package net.focik.homeoffice.library.domain.exception;

import net.focik.homeoffice.library.domain.model.UserBook;
import net.focik.homeoffice.utils.exceptions.ObjectAlreadyExistException;

public class UserBookAlreadyExistException extends ObjectAlreadyExistException {
    public UserBookAlreadyExistException(UserBook userBook) {
        super("UserBook already exists: " + userBook.toString());
    }
}
