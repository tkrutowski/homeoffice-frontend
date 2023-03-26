package net.focik.homeoffice.library.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class Bookstore {
    private Integer id;
    private String name;
    private String url;

    public Bookstore(Integer id) {
        this.id = id;
    }
}