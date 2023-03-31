package net.focik.homeoffice.library.domain;

import lombok.RequiredArgsConstructor;
import net.focik.homeoffice.library.domain.exception.UserBookNotFoundException;
import net.focik.homeoffice.library.domain.model.ReadingStatus;
import net.focik.homeoffice.library.domain.model.UserBook;
import net.focik.homeoffice.library.domain.port.secondary.UserBookRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
class UserBookService {

    private final UserBookRepository userBookRepository;

    public List<UserBook> findUserBooksForBookId(Integer idBook, Integer idUser) {
        List<UserBook> allByBook = userBookRepository.findAllByIdBook(idBook);
        return allByBook.stream()
                .filter(userBook -> idUser.equals(userBook.getUser().getId().intValue()))
                .collect(Collectors.toList());
    }

    public UserBook addUserBook(UserBook userBook) {
        return userBookRepository.add(userBook);
    }

    public UserBook updateUserBook(UserBook userBook) {
        Optional<UserBook> userBookById = userBookRepository.findById(userBook.getId());
        if (userBookById.isEmpty()) {
            throw new UserBookNotFoundException(userBook.getId());
        }

        userBookById.get().setBookstore(userBook.getBookstore());
        userBookById.get().setReadingStatus(userBook.getReadingStatus());
        userBookById.get().setEditionType(userBook.getEditionType());
        userBookById.get().setOwnershipStatus(userBook.getOwnershipStatus());
        userBookById.get().setReadFrom(userBook.getReadFrom());
        userBookById.get().setReadTo(userBook.getReadTo());
        userBookById.get().setInfo(userBook.getInfo());

        return userBookRepository.edit(userBookById.get());
    }

    public void deleteUserBook(Integer id) {
        userBookRepository.delete(id);
    }

    public UserBook findUserBook(Integer id) {
        Optional<UserBook> userBookById = userBookRepository.findById(id);
        if (userBookById.isEmpty()) {
            throw new UserBookNotFoundException(id);
        }
        return userBookById.get();
    }

    public List<UserBook> findBookByUserAndReadStatus(Long id, ReadingStatus readingStatus) {
        return userBookRepository.findAllByUserAndReadStatus(id, readingStatus);
    }

    public List<UserBook> findBookByUserAndReadStatusAndYear(Long id, ReadingStatus readingStatus, int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate stopDate = LocalDate.of(year, 12, 31);
        return userBookRepository.findAllByUserAndReadStatusAndYear(id, readingStatus, startDate, stopDate);
    }

}