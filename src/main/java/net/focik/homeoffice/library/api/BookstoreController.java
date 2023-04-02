package net.focik.homeoffice.library.api;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.library.api.dto.BookstoreDto;
import net.focik.homeoffice.library.domain.model.Bookstore;
import net.focik.homeoffice.library.domain.port.primary.DeleteBookstoreUseCase;
import net.focik.homeoffice.library.domain.port.primary.FindBookstoreUseCase;
import net.focik.homeoffice.library.domain.port.primary.SaveBookstoreUseCase;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@RestController
@RequestMapping("/api/library/bookstore")
public class BookstoreController {
    private final ModelMapper mapper;
    private final FindBookstoreUseCase findBookstoreUseCase;
    private final SaveBookstoreUseCase saveBookstoreUseCase;
    private final DeleteBookstoreUseCase deleteBookstoreUseCase;

    @GetMapping
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<List<BookstoreDto>> getAllBookstores() {
        List<Bookstore> allBookstores = findBookstoreUseCase.findAllBookstores();
        return new ResponseEntity<>(allBookstores.stream()
                .map(bookstore -> mapper.map(bookstore, BookstoreDto.class))
                .collect(Collectors.toList()), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookstoreDto> getBookstore(@PathVariable Integer id) {
        Bookstore bookstoreById = findBookstoreUseCase.findBookstoreById(id);
        return new ResponseEntity<>(mapper.map(bookstoreById, BookstoreDto.class), HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('LIBRARY_WRITE_ALL','LIBRARY_WRITE')")
    public ResponseEntity<BookstoreDto> addBookstore(@RequestBody BookstoreDto bookstoreDto) {
        Bookstore bookstore = mapper.map(bookstoreDto, Bookstore.class);
        Bookstore saved = saveBookstoreUseCase.addBookstore(bookstore);
        return new ResponseEntity<>(mapper.map(saved, BookstoreDto.class), HttpStatus.OK);
    }

    @PutMapping("/id")
    @PreAuthorize("hasAnyAuthority('LIBRARY_WRITE_ALL','LIBRARY_WRITE')")
    public ResponseEntity<BookstoreDto> editBookstore(@RequestBody BookstoreDto bookstoreDto) {
        Bookstore bookstore = mapper.map(bookstoreDto, Bookstore.class);
        Bookstore saved = saveBookstoreUseCase.updateBookstore(bookstore);
        return new ResponseEntity<>(mapper.map(saved, BookstoreDto.class), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('LIBRARY_DELETE_ALL','LIBRARY_DELETE')")
    public void deleteBookstore(@PathVariable Integer id) {
        deleteBookstoreUseCase.deleteBookstore(id);
    }
}