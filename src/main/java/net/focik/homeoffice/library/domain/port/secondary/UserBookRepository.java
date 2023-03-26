package net.focik.homeoffice.library.domain.port.secondary;

import net.focik.homeoffice.library.domain.model.ReadingStatus;
import net.focik.homeoffice.library.domain.model.UserBook;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
public interface UserBookRepository {

    UserBook add(UserBook userBook);

    UserBook edit(UserBook userBook);

    boolean delete(Integer id);

    List<UserBook> findAll();

    List<UserBook> findAllByIdBook(Integer idBook);
    List<UserBook> findAllByUserAndReadStatus(Long idUser, ReadingStatus readingStatus);
    List<UserBook> findAllByUserAndReadStatusAndYear(Long idUser, ReadingStatus readingStatus, LocalDate startDate, LocalDate stopDate );

    Optional<UserBook> findById(Integer id);

}
