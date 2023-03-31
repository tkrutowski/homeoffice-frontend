package net.focik.homeoffice.library.api;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.library.api.dto.EditionTypeDto;
import net.focik.homeoffice.library.api.dto.OwnershipStatusDto;
import net.focik.homeoffice.library.api.dto.ReadingStatusDto;
import net.focik.homeoffice.library.api.dto.UserBookApiDto;
import net.focik.homeoffice.library.api.mapper.ApiUserBookMapper;
import net.focik.homeoffice.library.domain.model.EditionType;
import net.focik.homeoffice.library.domain.model.OwnershipStatus;
import net.focik.homeoffice.library.domain.model.ReadingStatus;
import net.focik.homeoffice.library.domain.model.UserBook;
import net.focik.homeoffice.library.domain.port.primary.DeleteUserBookUseCase;
import net.focik.homeoffice.library.domain.port.primary.FindUserBookUseCase;
import net.focik.homeoffice.library.domain.port.primary.SaveUserBookUseCase;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.OK;

@AllArgsConstructor
@RestController
@RequestMapping("/api/library/userbook")
public class UserBookController {

    private final FindUserBookUseCase findUserBookUseCase;
    private final SaveUserBookUseCase saveUserBookUseCase;
    private final DeleteUserBookUseCase deleteUserBookUseCase;
    private final ApiUserBookMapper userBookMapper;

    @GetMapping("/check")
    @PreAuthorize("hasAnyAuthority('LIBRARY_READ_ALL','LIBRARY_READ')")
    ResponseEntity<List<UserBookApiDto>> checkIfUserbook(@RequestParam(name = "id") int id) {
        String userName = SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString();
        List<UserBook> userBooksForBookId = findUserBookUseCase.findUserBooksForBookId(id, userName);
        return new ResponseEntity<>(userBooksForBookId.stream()
                .map(userBookMapper::toDto)
                .collect(Collectors.toList()), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('LIBRARY_READ_ALL','LIBRARY_READ')")
    ResponseEntity<UserBookApiDto> findById(@PathVariable int id) {
        UserBook userBook = findUserBookUseCase.findUserBook(id);
        return new ResponseEntity<>(userBookMapper.toDto(userBook), HttpStatus.OK);
    }

    @GetMapping("/status")
    @PreAuthorize("hasAnyAuthority('LIBRARY_READ_ALL','LIBRARY_READ')")
    ResponseEntity<List<UserBookApiDto>> getAllUserBooks(@RequestParam(name = "status") ReadingStatus readingStatus,
                                                         @RequestParam(name = "year", required = false) Integer year) {
        String userName = SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString();
        List<UserBook> allBooks;
        if (readingStatus.equals(ReadingStatus.READ)) {
            allBooks = findUserBookUseCase.findBookByUserAndReadStatusAndYear(userName, readingStatus, year == null ? LocalDate.now().getYear() : year);
        } else {
            allBooks = findUserBookUseCase.findBookByUserAndReadStatus(userName, readingStatus);
        }
        allBooks.sort((o1, o2) -> StringUtils.compare(o1.getBook().getTitle(), o2.getBook().getTitle()));
        return new ResponseEntity<>(allBooks.stream()
                .map(userBookMapper::toDto)
                .collect(Collectors.toList()), HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('LIBRARY_READ_ALL','LIBRARY_READ')")
    public ResponseEntity<UserBookApiDto> addUserBook(@RequestBody UserBookApiDto userBookDto) {
        String userName = SecurityContextHolder.getContext().getAuthentication().getPrincipal().toString();
        UserBook saved = saveUserBookUseCase.addUserBook(userBookMapper.toDomain(userBookDto), userName);
        return new ResponseEntity<>(userBookMapper.toDto(saved), HttpStatus.OK);
    }

    @PutMapping()
    @PreAuthorize("hasAnyAuthority('LIBRARY_READ_ALL','LIBRARY_READ')")
    public ResponseEntity<UserBookApiDto> editUserBook(@RequestBody UserBookApiDto userBookDto) {
        UserBook saved = saveUserBookUseCase.updateUserBook(userBookMapper.toDomain(userBookDto));
        return new ResponseEntity<>(userBookMapper.toDto(saved), HttpStatus.OK);
    }

    @GetMapping("/reading_status")
    ResponseEntity<List<ReadingStatusDto>> getReadingStatus() {
        ReadingStatus[] collect = (ReadingStatus.values());
        List<ReadingStatusDto> statusDtos = Arrays.stream(collect)
                .map(type -> new ReadingStatusDto(type.name(), type.getViewValue()))
                .collect(Collectors.toList());
        return new ResponseEntity<>(statusDtos, OK);
    }

    @GetMapping("/ownership_status")
    ResponseEntity<List<OwnershipStatusDto>> getOwnershipStatus() {
        OwnershipStatus[] collect = (OwnershipStatus.values());
        List<OwnershipStatusDto> statusDtos = Arrays.stream(collect)
                .map(type -> new OwnershipStatusDto(type.name(), type.getViewValue()))
                .collect(Collectors.toList());
        return new ResponseEntity<>(statusDtos, OK);
    }

    @GetMapping("/edition_type")
    ResponseEntity<List<EditionTypeDto>> getEditionType() {
        EditionType[] collect = (EditionType.values());
        List<EditionTypeDto> statusDtos = Arrays.stream(collect)
                .map(type -> new EditionTypeDto(type.name(), type.name()))
                .collect(Collectors.toList());
        return new ResponseEntity<>(statusDtos, OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('LIBRARY_READ_ALL','LIBRARY_READ')")
    public ResponseEntity<Boolean> deleteUserBook(@PathVariable Integer id) {
        boolean isDeleted = deleteUserBookUseCase.deleteUserBook(id);
        return new ResponseEntity<>(isDeleted, OK);
    }
}
