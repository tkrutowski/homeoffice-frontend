package net.focik.homeoffice.utils.share;

public enum PaymentType {
    CASH("gotówka"),
    CASH_LATE("gotówka terminowa"),
    TRANSFER("przelew");

    private final String viewValue;

    PaymentType(String viewValue) {
        this.viewValue = viewValue;
    }

    public String getViewValue() {
        return viewValue;
    }
}
