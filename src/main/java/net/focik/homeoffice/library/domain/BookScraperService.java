package net.focik.homeoffice.library.domain;

import lombok.RequiredArgsConstructor;
import net.focik.homeoffice.library.domain.model.BookDto;
import net.focik.homeoffice.library.domain.model.WebSite;
import net.focik.homeoffice.library.infrastructure.upolujebooka.UpolujebookaScrapper;
import org.springframework.stereotype.Service;

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
}