package net.focik.homeoffice.library.domain.port.secondary;

import net.focik.homeoffice.library.domain.model.Author;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public interface AuthorRepository {

    Author add(Author author);

    Optional<Author> findById(Integer id);

    List<Author> findAll();

    boolean delete(Integer id);

    Optional<Author> edit(Author author);

    Optional<Author> findByFirstNameAndLastName(String firstName, String lastName);
}
