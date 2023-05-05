package net.focik.homeoffice.finance.domain.firm;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.finance.domain.firm.port.primary.AddFirmUseCase;
import net.focik.homeoffice.finance.domain.firm.port.primary.DeleteFirmUseCase;
import net.focik.homeoffice.finance.domain.firm.port.primary.GetFirmUseCase;
import net.focik.homeoffice.finance.domain.firm.port.primary.UpdateFirmUseCase;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@AllArgsConstructor
public class FirmFacade implements AddFirmUseCase, UpdateFirmUseCase, GetFirmUseCase, DeleteFirmUseCase {

    private final FirmService firmService;

    @Override
    public Firm addFirm(Firm firm) {
        return firmService.addFirm(firm);
    }

    @Override
    public Firm updateFirm(Firm firm) {
        return firmService.updateFirm(firm);
    }

    @Override
    public void deleteFirm(Integer id) {
        firmService.deleteFirm(id);
    }

    @Override
    public Firm findById(Integer id, Boolean isAddress) {
        return firmService.findById(id, isAddress);
    }

    @Override
    public Firm findByName(String name, Boolean isAddress) {
        return firmService.findByName(name, isAddress);
    }

    @Override
    public List<Firm> findByAll(Boolean isGetAddress) {
        return firmService.findByAll(isGetAddress);
    }

}
