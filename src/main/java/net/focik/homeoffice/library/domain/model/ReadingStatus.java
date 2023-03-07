package net.focik.homeoffice.library.domain.model;


public enum ReadingStatus {
    NOT_READ("Nieprzeczytana"), READ_NOW("Czytana"), READ("Przeczytana");

    private final String description;

    ReadingStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return this.description;
    }
}
