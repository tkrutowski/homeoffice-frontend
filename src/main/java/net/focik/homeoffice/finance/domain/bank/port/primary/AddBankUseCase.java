package net.focik.homeoffice.finance.domain.bank.port.primary;

import net.focik.homeoffice.finance.domain.bank.Bank;

public interface AddBankUseCase {
    Bank addBank(Bank bank);
}
