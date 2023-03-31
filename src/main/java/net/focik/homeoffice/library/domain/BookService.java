package net.focik.homeoffice.library.domain;

import lombok.RequiredArgsConstructor;
import net.focik.homeoffice.library.domain.exception.BookAlreadyExistException;
import net.focik.homeoffice.library.domain.exception.BookNotFoundException;
import net.focik.homeoffice.library.domain.model.Book;
import net.focik.homeoffice.library.domain.model.Series;
import net.focik.homeoffice.library.domain.port.secondary.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
class BookService {

    private final BookRepository bookRepository;

    public Book addBook(Book book) {
        if (isBookExist(book))
            throw new BookAlreadyExistException(book);
        return Optional.of(bookRepository.add(book))
                .get().orElse(null);
    }

    private boolean isBookExist(Book book) {
        List<Book> allByTitle = bookRepository.findAllByTitle(book.getTitle());
        if (!allByTitle.isEmpty()) {
            for (Book bookFound : allByTitle) {
                if (book.equals(bookFound)) {
                    return true;
                }
            }
        }
        return false;
    }

    public Book findBook(Integer id) {
        Optional<Book> bookById = bookRepository.findById(id);
        if (bookById.isEmpty()) {
            throw new BookNotFoundException(id);
        }
        return bookById.get();
    }

    public List<Book> findAllBooks() {
        return bookRepository.findAll();
    }


    public Book updateBook(Book book) {
        Book bookToEdit = findBook(book.getId());
        bookToEdit.setCover(book.getCover());
        bookToEdit.setDescription(book.getDescription());
        bookToEdit.setTitle(book.getTitle());

        Optional<Book> updatedBook = bookRepository.update(book);
        if (updatedBook.isEmpty()) {
            throw new BookNotFoundException(book.getTitle());
        }
        return updatedBook.get();
    }

    public void deleteBook(Integer id) {
        bookRepository.delete(id);
    }

    public List<Book> findAllBooksInSeries(Series series) {
        return bookRepository.findAllBySeries(series);
    }
}