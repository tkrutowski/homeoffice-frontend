package net.focik.homeoffice.finance.domain.fee.port.primary;

public interface DeleteFeeUseCase {
    void deleteFeeById(int id);

    void deleteFeeInstallmentById(int id);
}
