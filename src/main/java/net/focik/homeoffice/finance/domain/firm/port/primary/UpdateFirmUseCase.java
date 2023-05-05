package net.focik.homeoffice.finance.domain.firm.port.primary;

import net.focik.homeoffice.finance.domain.firm.Firm;

public interface UpdateFirmUseCase {
    Firm updateFirm(Firm firm);
}
