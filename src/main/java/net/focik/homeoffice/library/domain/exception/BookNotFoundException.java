package net.focik.homeoffice.library.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotFoundException;

public class BookNotFoundException extends ObjectNotFoundException {
    public BookNotFoundException(Integer id) {
        super("Book with id = " + id + " does not exist");
    }

    public BookNotFoundException(String title) {
        super("Nie znaleziono książki pt.: "+ title);
    }
}
