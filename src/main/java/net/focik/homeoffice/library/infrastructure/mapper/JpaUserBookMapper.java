package net.focik.homeoffice.library.infrastructure.mapper;

import lombok.RequiredArgsConstructor;
import net.focik.homeoffice.library.domain.model.*;
import net.focik.homeoffice.library.infrastructure.dto.*;
import net.focik.homeoffice.library.infrastructure.jpa.AuthorDtoRepository;
import net.focik.homeoffice.library.infrastructure.jpa.CategoryDtoRepository;
import net.focik.homeoffice.library.infrastructure.jpa.SeriesDtoRepository;
import org.modelmapper.ModelMapper;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JpaUserBookMapper {

//    private final SeriesDtoRepository seriesDtoRepository;
//    private final CategoryDtoRepository categoryDtoRepository;
//    private final AuthorDtoRepository authorDtoRepository;
    private final ModelMapper mapper;
    private final JpaBookMapper bookMapper;

    public UserBookDbDto toDto(UserBook userBook) {
        return UserBookDbDto.builder()
                .id(userBook.getId())
                .book(bookMapper.toDto(userBook.getBook()))
                .user(userBook.getUser())
                .bookstore(mapper.map(userBook.getBookstore(), BookstoreDbDto.class))
                .editionType(userBook.getEditionType())
                .readingStatus(userBook.getReadingStatus())
                .ownershipStatus(userBook.getOwnershipStatus())
                .readFrom(userBook.getReadFrom())
                .readTo(userBook.getReadTo())
                .info(userBook.getInfo())
                .build();
    }

    public UserBook toDomain(UserBookDbDto dto) {
        return UserBook.builder()
                .id(dto.getId())
                .book(bookMapper.toDomain(dto.getBook()))
                .user(dto.getUser())
                .bookstore(mapper.map(dto.getBookstore(), Bookstore.class))
                .editionType(dto.getEditionType())
                .readingStatus(dto.getReadingStatus())
                .ownershipStatus(dto.getOwnershipStatus())
                .readFrom(dto.getReadFrom())
                .readTo(dto.getReadTo())
                .info(dto.getInfo())
                .build();
    }

}