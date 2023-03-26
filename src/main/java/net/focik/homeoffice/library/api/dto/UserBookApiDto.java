package net.focik.homeoffice.library.api.dto;

import lombok.*;
import net.focik.homeoffice.library.domain.model.BookDto;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public
class UserBookApiDto implements BookDto {

    private Integer id;
    private Integer idUser;
    private BookApiDto book;
    private Integer idBookstore;
    private String editionType;
    private String readingStatus;
    private String ownershipStatus;
    private String readFrom;
    private String readTo;
    private String info;
}
