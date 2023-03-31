package net.focik.homeoffice.library.domain;

import lombok.RequiredArgsConstructor;
import net.focik.homeoffice.library.domain.model.BookDto;
import net.focik.homeoffice.library.domain.model.WebSite;
import net.focik.homeoffice.library.infrastructure.upolujebooka.BookScraperDto;
import net.focik.homeoffice.library.infrastructure.upolujebooka.UpolujebookaScrapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
class BookScraperService {

    public BookDto findBookByUrl(WebSite webSite, String url) {
        BookDto bookDto = null;
        switch (webSite) {
            case UPOLUJ_EBOOKA:
                bookDto = UpolujebookaScrapper.findBookFromUrl(url);
                break;
            case EMPIK:
                break;
        }
        return bookDto;
    }

    public List<BookDto> findBooksInSeries(String url) {
        List<String> booksFromUrl = UpolujebookaScrapper.findBooksFromUrl(url);
        return booksFromUrl.stream()
                .map(bookUrl -> findBookByUrl(WebSite.UPOLUJ_EBOOKA, bookUrl))
                .map(BookScraperDto.class::cast)
                .filter(bookDto -> !bookDto.getTitle().isBlank())
                .collect(Collectors.toList());
    }
}