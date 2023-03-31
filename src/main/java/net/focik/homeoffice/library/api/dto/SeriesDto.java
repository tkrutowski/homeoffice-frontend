package net.focik.homeoffice.library.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class SeriesDto {
    private Integer id;
    private String title;
    private String description;
    private String url;
}