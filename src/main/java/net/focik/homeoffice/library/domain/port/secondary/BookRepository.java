package net.focik.homeoffice.library.domain.port.secondary;

import net.focik.homeoffice.library.domain.model.Book;
import net.focik.homeoffice.library.domain.model.Series;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public interface BookRepository {

    Optional<Book> add(Book book);

    Optional<Book> update(Book book);

    void delete(Integer id);

    List<Book> findAll();

    Optional<Book> findById(Integer id);

    List<Book> findAllByTitle(String title);

    List<Book> findAllBySeries(Series series);

    Optional<Book> findByTitle(String title);
}
