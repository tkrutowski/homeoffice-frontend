package net.focik.homeoffice.library.domain.port.primary;

import net.focik.homeoffice.library.domain.model.Book;
import net.focik.homeoffice.library.domain.model.BookDto;
import net.focik.homeoffice.library.domain.model.Series;
import net.focik.homeoffice.library.domain.model.WebSite;

import java.util.List;

public interface FindBookUseCase {
    Book findBook(Integer idBook);

    List<Book> findAllBooks();

    List<Book> findAllBooksInSeries(Series series);

    BookDto findBookByUrl(WebSite webSite, String url);
}
