package net.focik.homeoffice.library.domain.model;


public enum OwnershipStatus {
    HAVE("Mam"), WONT("Chce"), READ_ONLY("Tylko czytam");

    private final String viewValue;

    OwnershipStatus(String viewValue) {
        this.viewValue = viewValue;
    }

    public String getViewValue() {
        return this.viewValue;
    }
}
