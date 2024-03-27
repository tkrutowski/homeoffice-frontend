package net.focik.homeoffice.library.api.mapper;

import net.focik.homeoffice.library.api.dto.AuthorDto;
import net.focik.homeoffice.library.domain.exception.AuthorNotValidException;
import net.focik.homeoffice.library.domain.model.Author;
import org.springframework.stereotype.Component;

@Component
public class ApiAuthorMapper {

    public Author toDomain(AuthorDto dto) {
        valid(dto);
        return Author.builder()
                .id(dto.getId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .build();
    }

    public AuthorDto toDto(Author author) {
        return AuthorDto.builder()
                .id(author.getId())
                .firstName(author.getFirstName())
                .lastName(author.getLastName())
                .build();
    }

    private void valid(AuthorDto dto) {
        if (dto.getLastName().isEmpty())
            throw new AuthorNotValidException("Lastname can't be empty.");
    }
}