package net.focik.homeoffice.library.api.mapper;

import net.focik.homeoffice.library.api.dto.BookApiDto;
import net.focik.homeoffice.library.domain.model.Author;
import net.focik.homeoffice.library.domain.model.Book;
import net.focik.homeoffice.library.domain.model.Category;
import net.focik.homeoffice.library.domain.model.Series;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class ApiBookMapper {

    public BookApiDto toDto(Book book) {
        return BookApiDto.builder()
                .id(book.getId() != null ? book.getId() : 0)
                .series(book.getSeries() == null ? "" : book.getSeries().getTitle())
                .authors(getAuthorsAsString(book.getAuthors()))
                .categories(getCategoriesAsString(book.getCategories()))
                .title(book.getTitle())
                .description(book.getDescription())
                .cover(book.getCover())
                .bookInSeriesNo(book.getBookInSeriesNo())
                .build();
    }


    private String getAuthorsAsString(Set<Author> authors) {
        StringBuilder builder = new StringBuilder();
        List<Author> sortedList = authors
                .stream()
                .sorted(Comparator.comparing(Author::getLastName))
                .collect(Collectors.toList());
        for (Author author : sortedList) {
            builder.append(author.getFirstName());
            builder.append(" ");
            builder.append(author.getLastName());
            builder.append(", ");
        }
        int index = builder.lastIndexOf(",");
        if (index > 0) {
            builder.deleteCharAt(index);
        }
        return builder.toString();
    }

    private String getCategoriesAsString(Set<Category> categories) {
        StringBuilder builder = new StringBuilder();
        for (Category categoryDto : categories) {
            builder.append(categoryDto.getName());
            builder.append(", ");
        }
        int index = builder.lastIndexOf(",");
        if (index > 0) {
            builder.deleteCharAt(index);
        }
        return builder.toString();
    }

    public Book toDomain(BookApiDto dto) {
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

        authorDto.setLastName(authorDto.getLastName()  + "-" + author.substring(i + 1).trim());
        return authorDto;
    }
}