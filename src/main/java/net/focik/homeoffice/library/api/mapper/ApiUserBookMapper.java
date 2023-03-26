package net.focik.homeoffice.library.api.mapper;

import io.vavr.control.Try;
import lombok.RequiredArgsConstructor;
import net.focik.homeoffice.library.api.dto.BookApiDto;
import net.focik.homeoffice.library.api.dto.UserBookApiDto;
import net.focik.homeoffice.library.domain.model.*;
import net.focik.homeoffice.userservice.domain.AppUser;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ApiUserBookMapper {
private final ApiBookMapper bookMapper;

    public UserBookApiDto toDto(UserBook userBook) {
        return UserBookApiDto.builder()
                .id(userBook.getId() != null ? userBook.getId() : 0)
                .idUser(Math.toIntExact(userBook.getUser().getId()))
                .idBookstore(userBook.getBookstore().getId())
                .book(bookMapper.toDto(userBook.getBook()))
                .editionType(userBook.getEditionType().toString())
                .readingStatus(userBook.getReadingStatus().toString())
                .ownershipStatus(userBook.getOwnershipStatus().toString())
                .readFrom(userBook.getReadFrom() != null ? userBook.getReadFrom().toString() : "")
                .readTo(userBook.getReadTo()!=null?userBook.getReadTo().toString():"")
                .info(userBook.getInfo()!=null?userBook.getInfo():"")
                .build();
    }

    public UserBook toDomain(UserBookApiDto dto) {
        return UserBook.builder()
                .id(dto.getId())
                .user(new AppUser(dto.getIdUser().longValue()))
                .bookstore(new Bookstore(dto.getIdBookstore()))
                .book(bookMapper.toDomain(dto.getBook()))
                .editionType(EditionType.valueOf(dto.getEditionType()))
                .readingStatus(ReadingStatus.valueOf(dto.getReadingStatus()))
                .ownershipStatus(OwnershipStatus.valueOf(dto.getOwnershipStatus()))
                .readFrom(Try.of(() -> LocalDate.parse(dto.getReadFrom())).getOrNull())
                .readTo(Try.of(() -> LocalDate.parse(dto.getReadTo())).getOrNull())
                .info(dto.getInfo())
                .build();
    }

}