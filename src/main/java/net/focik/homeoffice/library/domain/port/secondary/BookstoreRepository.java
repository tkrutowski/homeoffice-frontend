package net.focik.homeoffice.library.domain.port.secondary;

import net.focik.homeoffice.library.domain.model.Bookstore;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public interface BookstoreRepository {

    Optional<Bookstore> add(Bookstore bookstore);

    Optional<Bookstore> edit(Bookstore bookstore);

    void delete(Integer id);

    List<Bookstore> findAll();

    Optional<Bookstore> findById(Integer id);

    Optional<Bookstore> findByName(String name);
}
