package net.focik.homeoffice.library.domain.exception;

import net.focik.homeoffice.library.domain.model.Bookstore;
import net.focik.homeoffice.utils.exceptions.ObjectAlreadyExistException;

public class BookstoreAlreadyExistException extends ObjectAlreadyExistException {
    public BookstoreAlreadyExistException(Bookstore bookstore) {
        super("Bookstore already exists: " + bookstore.toString());
    }
}
