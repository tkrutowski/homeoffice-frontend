package net.focik.homeoffice.library.domain.model;


import lombok.Getter;

@Getter
public enum EditionType {
    BOOK("Książka"), EBOOK("E-book"), AUDIOBOOK("Audiobook");

    private final String viewName;

    EditionType(String viewName) {
        this.viewName = viewName;
    }

}
