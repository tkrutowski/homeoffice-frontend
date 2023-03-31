package net.focik.homeoffice.library.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotFoundException;

public class BookstoreNotFoundException extends ObjectNotFoundException {
    public BookstoreNotFoundException(Long id) {
        super("Bookstore with id = " + id + " not found");
    }

    public BookstoreNotFoundException(String name) {
        super("Bookstore with name:  " + name + " not found");
    }
}
