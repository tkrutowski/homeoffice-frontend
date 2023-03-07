package net.focik.homeoffice.library.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Objects;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class Series {
    private Integer id;
    private String title;
    private String description;

    @Override
    public String toString() {
        return  title;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Series series = (Series) o;
        return title.equals(series.title);
    }

    @Override
    public int hashCode() {
        return Objects.hash(title);
    }
}
