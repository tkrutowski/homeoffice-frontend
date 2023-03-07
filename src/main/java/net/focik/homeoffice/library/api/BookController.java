package net.focik.homeoffice.library.api;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.library.api.dto.BookApiDto;
import net.focik.homeoffice.library.api.dto.SeriesDto;
import net.focik.homeoffice.library.api.mapper.ApiBookMapper;
import net.focik.homeoffice.library.domain.model.Book;
import net.focik.homeoffice.library.domain.model.BookDto;
import net.focik.homeoffice.library.domain.model.Series;
import net.focik.homeoffice.library.domain.model.WebSite;
import net.focik.homeoffice.library.domain.port.primary.AddBookUseCase;
import net.focik.homeoffice.library.domain.port.primary.DeleteBookUseCase;
import net.focik.homeoffice.library.domain.port.primary.FindBookUseCase;
import net.focik.homeoffice.library.domain.port.primary.UpdateBookUseCase;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@RestController
@RequestMapping("/api/library/book")
public class BookController {

    private final AddBookUseCase addBookUseCase;
    private final FindBookUseCase findBookUseCase;
    private final DeleteBookUseCase deleteBookUseCase;
    private final UpdateBookUseCase updateBookUseCase;
    private final ModelMapper mapper;
    private final ApiBookMapper bookMapper;

    @GetMapping("/{id}")
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<BookApiDto> getById(@PathVariable int id) {
        Book book = findBookUseCase.findBook(id);
        return new ResponseEntity<>(bookMapper.toDto(book), HttpStatus.OK);
    }

    @GetMapping
    ResponseEntity<List<BookApiDto>> getAllBooks() {
        List<Book> allBooks = findBookUseCase.findAllBooks();
        return new ResponseEntity<>(allBooks.stream()
                .map(bookMapper::toDto)
                .collect(Collectors.toList()), HttpStatus.OK);
    }

    @GetMapping("/url")
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<BookDto> getBookByUrl(@RequestParam(name = "site") WebSite webSite, @RequestParam(name = "url") String url) {
        BookDto bookDtoByUrl = findBookUseCase.findBookByUrl(webSite, url);
        return new ResponseEntity<>(mapper.map(bookDtoByUrl, BookApiDto.class), HttpStatus.OK);
    }

    @GetMapping("/series")
    ResponseEntity<List<BookApiDto>> getAllBooksInSeries(@RequestBody SeriesDto series) {
        List<Book> allBooks = findBookUseCase.findAllBooksInSeries(mapper.map(series, Series.class));
        return new ResponseEntity<>(allBooks.stream()
                .map(bookMapper::toDto)
                .collect(Collectors.toList()), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<BookApiDto> addBook(@RequestBody BookApiDto bookDto) {
        Book bookToAdd = bookMapper.toDomain(bookDto);
        Book bookAdded = addBookUseCase.addBook(bookToAdd);
        return new ResponseEntity<>(bookMapper.toDto(bookAdded), HttpStatus.OK);
    }

    @PutMapping()
    public ResponseEntity<BookApiDto> editBook(@RequestBody BookApiDto bookDto) {
        Book bookToUpdate = bookMapper.toDomain(bookDto);
        Book updateBook = updateBookUseCase.updateBook(bookToUpdate);
        return new ResponseEntity<>(bookMapper.toDto(updateBook), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public void deleteBook(@PathVariable Integer id) {
        deleteBookUseCase.deleteBook(id);
    }
}