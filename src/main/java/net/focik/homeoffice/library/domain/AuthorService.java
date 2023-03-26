package net.focik.homeoffice.library.domain;

import lombok.RequiredArgsConstructor;
import net.focik.homeoffice.addresses.domain.exceptions.AddressNotFoundException;
import net.focik.homeoffice.library.domain.exception.AuthorAlreadyExistException;
import net.focik.homeoffice.library.domain.exception.AuthorNotFoundException;
import net.focik.homeoffice.library.domain.model.Author;
import net.focik.homeoffice.library.domain.port.secondary.AuthorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
class AuthorService {

    private final AuthorRepository authorRepository;

    public Integer addAuthor(Author author) {
        Optional<Author> optionalAuthor = authorRepository.findByFirstNameAndLastName(author.getFirstName(), author.getLastName());
        if (optionalAuthor.isPresent()) {
            throw new AuthorAlreadyExistException(author);
        }
        return authorRepository.add(author);
    }

    public List<Author> findAllAuthors() {
        return authorRepository.findAll();
    }

    public boolean deleteAuthor(Integer id) {
        return authorRepository.delete(id);
    }

    public Author editAuthor(Author author) {
        Optional<Author> authorById = authorRepository.findById(author.getId());
        if (!authorById.isPresent()) {
            throw new AuthorNotFoundException(author.getId());
        }

        Author authorTemp = authorById.get();
        authorTemp.setLastName(author.getLastName());
        authorTemp.setFirstName(author.getFirstName());

        return authorRepository.edit(authorTemp).get();
    }

    public Author findAuthor(Integer id) {
        Optional<Author> authorById = authorRepository.findById(id);
        if (!authorById.isPresent()) {
            throw new AddressNotFoundException(id);
        }
        return authorById.get();
    }

    public Author findAuthor(String firstName, String lastName) {
        Optional<Author> authorById = authorRepository.findByFirstNameAndLastName(firstName, lastName);
        if (!authorById.isPresent()) {
            throw new AuthorNotFoundException(firstName + ' ' + lastName);
        }
        return authorById.get();
    }
}
