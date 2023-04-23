package net.focik.homeoffice.finance.domain.loan.port.primary;

public interface DeleteLoanUseCase {
    void deleteLoanById(int id);

    void deleteLoanInstallmentById(int id);
}
