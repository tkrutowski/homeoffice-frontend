package net.focik.homeoffice.library.api.dto;

import lombok.*;
import net.focik.homeoffice.library.domain.model.BookDto;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class BookApiDto implements BookDto {

    private Integer id;
    private String series;
    private String seriesURL;
    private String authors;
    private String categories;
    private String title;
    private String description;
    private String cover;
    private int bookInSeriesNo;
}
