package net.focik.homeoffice.library.domain.model;


public enum ReadingStatus {
    NOT_READ("Nieprzeczytana"), READ_NOW("Czytana"), READ("Przeczytana");

    private final String viewValue;

    ReadingStatus(String viewValue) {
        this.viewValue = viewValue;
    }

    public String getViewValue() {
        return this.viewValue;
    }
}
