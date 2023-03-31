package net.focik.homeoffice.library.domain.exception;

import net.focik.homeoffice.utils.exceptions.ObjectNotFoundException;

public class AuthorNotFoundException extends ObjectNotFoundException {
    public AuthorNotFoundException(Integer id) {
        super("Author with id = " + id + " does not exist");
    }

    public AuthorNotFoundException(String name) {
        super("Author with name: " + name + " does not exist");
    }
}
