package net.focik.homeoffice.library.domain.port.primary;

import net.focik.homeoffice.library.domain.model.Book;
import net.focik.homeoffice.library.domain.model.WebSite;

import java.util.List;

public interface FindBookUseCase {
    Book findBook(Integer idBook);

    List<Book> findAllBooks();

    List<Book> findAllBooksInSeries(Integer idSeries);

    List<Book> findNewBooksInSeries(Integer idSeries);

    Book findBookByUrl(WebSite webSite, String url);

}
