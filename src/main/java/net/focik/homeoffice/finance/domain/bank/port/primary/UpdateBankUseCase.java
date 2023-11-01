package net.focik.homeoffice.finance.domain.bank.port.primary;

import net.focik.homeoffice.finance.domain.bank.Bank;

public interface UpdateBankUseCase {
    Bank updateBank(Bank bank);
}
