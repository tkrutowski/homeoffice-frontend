package net.focik.homeoffice.library.domain.port.primary;

import net.focik.homeoffice.library.domain.model.Book;

public interface UpdateBookUseCase {
    Book updateBook(Book book);
}
