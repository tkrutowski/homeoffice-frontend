package net.focik.homeoffice.finance.domain.fee;

public enum FeeFrequencyEnum {
    ONE_MONTH("miesięczne",1),
    TWO_MONTHS("dwumiesięczne",2),
    THREE_MONTHS("kwartalne",3),
    SIX_MONTHS("półroczne",6),
    ONE_YEAR("roczne",12);

    private final String viewValue;
    private final int frequencyNumber;

    FeeFrequencyEnum(String viewValue, int frequencyNumber) {
        this.viewValue = viewValue;
        this.frequencyNumber=frequencyNumber;
    }

    public String getViewValue() {
        return viewValue;
    }
    public int getFrequencyNumber() {
        return frequencyNumber;
    }
}
