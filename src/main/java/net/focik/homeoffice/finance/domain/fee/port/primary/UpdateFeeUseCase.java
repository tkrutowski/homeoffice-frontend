package net.focik.homeoffice.finance.domain.fee.port.primary;

import net.focik.homeoffice.finance.domain.fee.Fee;
import net.focik.homeoffice.finance.domain.fee.FeeInstallment;
import net.focik.homeoffice.utils.share.PaymentStatus;

public interface UpdateFeeUseCase {
    void updateFeeStatus(int idFee, PaymentStatus paymentStatus);

    Fee updateFee(Fee fee);

    FeeInstallment updateFeeInstallment(FeeInstallment feeInstallment);
}
