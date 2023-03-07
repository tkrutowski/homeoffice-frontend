package net.focik.homeoffice.library.domain;

import lombok.RequiredArgsConstructor;
import net.focik.homeoffice.library.domain.model.Book;
import net.focik.homeoffice.library.domain.model.BookDto;
import net.focik.homeoffice.library.domain.model.Series;
import net.focik.homeoffice.library.domain.model.WebSite;
import net.focik.homeoffice.library.domain.port.primary.AddBookUseCase;
import net.focik.homeoffice.library.domain.port.primary.DeleteBookUseCase;
import net.focik.homeoffice.library.domain.port.primary.FindBookUseCase;
import net.focik.homeoffice.library.domain.port.primary.UpdateBookUseCase;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class LibraryFacade implements FindBookUseCase, AddBookUseCase, UpdateBookUseCase, DeleteBookUseCase {

    private final BookService bookService;
    private final BookScraperService scraperService;

    @Override
    public Book findBook(Integer idBook) {
        return bookService.findBook(idBook);
    }

    @Override
    public List<Book> findAllBooks() {
        return bookService.findAllBooks();
    }

    @Override
    public List<Book> findAllBooksInSeries(Series series) {
        return bookService.findAllBooksInSeries(series);
    }

    @Override
    public BookDto findBookByUrl(WebSite webSite, String url) {
        return scraperService.findBookByUrl(webSite, url);
    }

    @Override
    public Book addBook(Book book) {
        return bookService.addBook(book);
    }

    @Override
    public void deleteBook(Integer idBook) {
        bookService.deleteBook(idBook);
    }

    @Override
    public Book updateBook(Book book) {
        return bookService.updateBook(book);
    }
}