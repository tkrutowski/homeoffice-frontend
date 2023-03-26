package net.focik.homeoffice.library.domain.port.primary;

import net.focik.homeoffice.library.domain.model.Bookstore;

public interface SaveBookstoreUseCase {
    Bookstore addBookstore(Bookstore bookstore);
    Bookstore updateBookstore(Bookstore bookstore);
}
