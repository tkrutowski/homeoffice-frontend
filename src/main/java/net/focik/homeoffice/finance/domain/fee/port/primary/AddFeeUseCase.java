package net.focik.homeoffice.finance.domain.fee.port.primary;

import net.focik.homeoffice.finance.domain.fee.Fee;
import net.focik.homeoffice.finance.domain.fee.FeeInstallment;

public interface AddFeeUseCase {
    Fee addFee(Fee fee);

    FeeInstallment addFeeInstallment(FeeInstallment feeInstallment);
}
