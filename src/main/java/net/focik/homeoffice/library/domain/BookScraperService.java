package net.focik.homeoffice.library.domain;

import lombok.RequiredArgsConstructor;
import net.focik.homeoffice.library.domain.model.*;
import net.focik.homeoffice.library.infrastructure.upolujebooka.BookScraperDto;
import net.focik.homeoffice.library.infrastructure.upolujebooka.UpolujebookaScrapper;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
class BookScraperService {

    public Book findBookByUrl(WebSite webSite, String url) {
        BookDto bookDto = null;
        switch (webSite) {
            case UPOLUJ_EBOOKA:
                bookDto = UpolujebookaScrapper.findBookFromUrl(url);
                break;
            case EMPIK:
                break;
        }
        return Objects.nonNull(bookDto) ? convertToBook((BookScraperDto) bookDto) : null;
    }

    public List<Book> findBooksInSeries(String url) {
        List<String> booksFromUrl = UpolujebookaScrapper.findBooksFromUrl(url);
        return booksFromUrl.stream()
                .map(bookUrl -> findBookByUrl(WebSite.UPOLUJ_EBOOKA, bookUrl))
                .collect(Collectors.toList());
    }

    private Book convertToBook(BookScraperDto dto) {
        return Book.builder()
                .id(dto.getId())
                .series(getSeriesFromString(dto.getSeries(), dto.getSeriesURL()))
                .authors(getAuthorsFromString(dto.getAuthors()))
                .categories(getCategoriesFromString(dto.getCategories()))
                .title(dto.getTitle())
                .description(dto.getDescription())
                .cover(dto.getCover())
                .bookInSeriesNo(dto.getBookInSeriesNo())
                .build();
    }

    private Series getSeriesFromString(String series, String seriesURL) {
        Series s = new Series();
        if (StringUtils.isNotEmpty(series))
            s.setTitle(series);
        s.setUrl(seriesURL);
        return s;
    }


    private Set<Author> getAuthorsFromString(String authors) {
        Set<Author> authorDtos = new HashSet<>();
        String[] authorsList = authors.trim().split(",");
        for (String author : authorsList) {
            authorDtos.add(validAuthor(author));
        }
        return authorDtos;
    }

    private Set<Category> getCategoriesFromString(String categories) {
        Set<Category> categoryDtos = new HashSet<>();
        String[] categoriesList = categories.trim().split(",");
        for (String category : categoriesList) {
            categoryDtos.add(new Category(0, category));
        }
        return categoryDtos;
    }

    private Author validAuthor(String author) {
        Author authorDto = new Author();
        String[] authorsSplit = author.trim().split(" ");

        if (authorsSplit.length == 1) {
            authorDto.setFirstName("");
            authorDto.setLastName(authorsSplit[0]);
        }
        if (authorsSplit.length > 1) {
            authorDto = author.lastIndexOf("-") > 0 ? getAuthorWithSeveralLastNames(author) : getAuthorWithSeveralFirstNames(author);
        }
        return authorDto;
    }

    private Author getAuthorWithSeveralFirstNames(String author) {
        Author authorDto = new Author();
        int i = author.lastIndexOf(" ");
        authorDto.setFirstName(author.substring(0, i).trim());
        authorDto.setLastName(author.substring(i).trim());
        return authorDto;
    }

    private Author getAuthorWithSeveralLastNames(String author) {
        Author authorDto;
        int i = author.lastIndexOf("-");
        authorDto = (getAuthorWithSeveralFirstNames(author.substring(0, i).trim()));

        authorDto.setLastName(authorDto.getLastName() + "-" + author.substring(i + 1).trim());
        return authorDto;
    }
}
