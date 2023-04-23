package net.focik.homeoffice.finance.domain.bank.port.primary;

import net.focik.homeoffice.finance.domain.bank.Bank;

import java.util.List;

public interface GetBankUseCase {
    Bank findById(Integer id, Boolean isAddress);

    Bank findByName(String name, Boolean isAddress);

    List<Bank> findByAll(Boolean isGetAddress);
}
