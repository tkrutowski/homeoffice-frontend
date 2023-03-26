package net.focik.homeoffice.library.domain.exception;

import net.focik.homeoffice.library.domain.model.Author;
import net.focik.homeoffice.utils.exceptions.ObjectAlreadyExistException;

public class AuthorAlreadyExistException extends ObjectAlreadyExistException {
    public AuthorAlreadyExistException(Author author) {
        super("Author already exists: " + author.toString());
    }
}
