package net.focik.homeoffice.finance.domain.firm.port.primary;

import net.focik.homeoffice.finance.domain.firm.Firm;

import java.util.List;

public interface GetFirmUseCase {
    Firm findById(Integer id, Boolean isAddress);

    Firm findByName(String name, Boolean isAddress);

    List<Firm> findByAll(Boolean isGetAddress);
}
