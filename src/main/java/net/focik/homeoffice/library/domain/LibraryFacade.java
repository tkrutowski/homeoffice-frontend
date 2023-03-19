package net.focik.homeoffice.library.domain;

import lombok.RequiredArgsConstructor;
import net.focik.homeoffice.library.domain.model.*;
import net.focik.homeoffice.library.domain.port.primary.*;
import net.focik.homeoffice.userservice.domain.AppUser;
import net.focik.homeoffice.userservice.domain.UserFacade;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class LibraryFacade implements FindBookUseCase, SaveBookUseCase, DeleteBookUseCase,
        FindSeriesUseCase, FindUserBookUseCase,FindBookstoreUseCase, SaveBookstoreUseCase, DeleteBookstoreUseCase {

    private final UserFacade userFacade;
    private final BookService bookService;
    private final BookScraperService scraperService;
    private final SeriesService seriesService;
    private final UserBookService userBookService;
    private final BookstoreService bookstoreService;

    @Override
    public Book findBook(Integer idBook) {
        return bookService.findBook(idBook);
    }

    @Override
    public List<Book> findAllBooks() {
        return bookService.findAllBooks();
    }

    @Override
    public List<Book> findAllBooksInSeries(Integer idSeries) {
        Series series = seriesService.findSeries(idSeries);
        return bookService.findAllBooksInSeries(series);
    }

    @Override
    public List<BookDto> findNewBooksInSeries(Integer idSeries) {
        Series series = seriesService.findSeries(idSeries);
        return scraperService.findBooksInSeries(series.getUrl());
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

    @Override
    public Series findSeries(Integer idSeries) {
        return null;
    }

    @Override
    public List<Series> getAllSeries() {
        return seriesService.getAllSeries();
    }

    @Override
    public Boolean checkIfUserBookFofBookId(Integer idBook, String userName) {
        AppUser user = userFacade.findUserByUsername(userName);
        return userBookService.checkIfUserBookFofBookId(idBook, Math.toIntExact(user.getId()));
    }

    @Override
    public UserBook findUserBook(Integer idUserBook) {
        return userBookService.findUserBook(idUserBook);
    }

    @Override
    public List<UserBook> findBookByUserAndReadStatus(String userName, ReadingStatus readingStatus) {
        AppUser user = userFacade.findUserByUsername(userName);
        return userBookService.findBookByUserAndReadStatus(user.getId(), readingStatus);
    }

    @Override
    public List<Bookstore> findAllBookstores() {
        return bookstoreService.findAllBookstores();
    }

    @Override
    public Bookstore findBookstoreById(Integer id) {
        return bookstoreService.findBookstore(id);
    }

    @Override
    public Bookstore addBookstore(Bookstore bookstore) {
        return bookstoreService.addBookstore(bookstore);
    }

    @Override
    public Bookstore updateBookstore(Bookstore bookstore) {
        return bookstoreService.updateBookstore(bookstore);
    }

    @Override
    public void deleteBookstore(Integer idBook) {
        bookstoreService.deleteBookstore(idBook);
    }
}