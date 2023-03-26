package net.focik.homeoffice.library.domain.port.primary;

import net.focik.homeoffice.library.domain.model.Book;

public interface SaveBookUseCase {
    Book addBook(Book book);
    Book updateBook(Book book);
}
