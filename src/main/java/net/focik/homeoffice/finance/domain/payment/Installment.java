package net.focik.homeoffice.finance.domain.payment;

import java.time.LocalDate;

public interface Installment {
    LocalDate getDeadLineDate();
}
