package net.focik.homeoffice.library.domain.model;


public enum OwnershipStatus {
    HAVE("Mam"), WONT("Chce"), READ_ONLY("Tylko czytam");

    private final String description;

    OwnershipStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return this.description;
    }
}
