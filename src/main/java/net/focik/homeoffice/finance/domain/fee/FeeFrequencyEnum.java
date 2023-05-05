package net.focik.homeoffice.finance.domain.fee;

public enum FeeFrequencyEnum {
    ONE_MONTH("miesięczne"),
    TWO_MONTHS("dwumiesięczne"),
    THREE_MONTHS("kwartalne"),
    SIX_MONTHS("półroczne"),
    ONE_YEAR("roczne");

    private final String viewValue;

    FeeFrequencyEnum(String viewValue) {
        this.viewValue = viewValue;
    }

    public String getViewValue() {
        return viewValue;
    }
}
