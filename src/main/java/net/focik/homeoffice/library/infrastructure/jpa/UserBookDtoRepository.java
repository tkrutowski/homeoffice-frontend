package net.focik.homeoffice.library.infrastructure.jpa;

import net.focik.homeoffice.library.domain.model.ReadingStatus;
import net.focik.homeoffice.library.infrastructure.dto.UserBookDbDto;
import org.springframework.data.repository.CrudRepository;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

interface UserBookDtoRepository extends CrudRepository<UserBookDbDto, Integer> {
    List<UserBookDbDto> findAllByBook_Id(Integer idBook);
    List<UserBookDbDto> findAllByReadingStatusAndUser_Id(ReadingStatus readingStatus, Long idUser);
    List<UserBookDbDto> findAllByReadingStatusAndUser_IdAndReadToBetween(ReadingStatus readingStatus, Long idUser, LocalDate startDate, LocalDate endDate);

}
