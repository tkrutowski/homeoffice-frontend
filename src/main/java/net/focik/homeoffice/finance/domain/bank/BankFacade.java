package net.focik.homeoffice.finance.domain.bank;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.finance.domain.bank.port.primary.AddBankUseCase;
import net.focik.homeoffice.finance.domain.bank.port.primary.DeleteBankUseCase;
import net.focik.homeoffice.finance.domain.bank.port.primary.GetBankUseCase;
import net.focik.homeoffice.finance.domain.bank.port.primary.UpdateBankUseCase;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@AllArgsConstructor
public class BankFacade implements AddBankUseCase, UpdateBankUseCase, GetBankUseCase, DeleteBankUseCase {

    private final BankService bankService;

    @Override
    public Bank addBank(Bank bank) {
        return bankService.addBank(bank);
    }

    @Override
    public Bank updateBank(Bank bank) {
        return bankService.updateBank(bank);
    }

    @Override
    public void deleteBank(Integer id) {
        bankService.deleteBank(id);
    }

    @Override
    public Bank findById(Integer id, Boolean isAddress) {
        return bankService.findById(id, isAddress);
    }

    @Override
    public Bank findByName(String name, Boolean isAddress) {
        return bankService.findByName(name, isAddress);
    }

    @Override
    public List<Bank> findByAll(Boolean isGetAddress) {
        return bankService.findByAll(isGetAddress);
    }

}
