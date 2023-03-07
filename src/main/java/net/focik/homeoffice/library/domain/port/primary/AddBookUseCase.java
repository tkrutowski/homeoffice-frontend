package net.focik.homeoffice.library.domain.port.primary;

import net.focik.homeoffice.library.domain.model.Book;

public interface AddBookUseCase {
    Book addBook(Book book);
}
