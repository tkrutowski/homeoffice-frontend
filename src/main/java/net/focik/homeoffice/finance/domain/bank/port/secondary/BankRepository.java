package net.focik.homeoffice.finance.domain.bank.port.secondary;

import net.focik.homeoffice.finance.domain.bank.Bank;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public interface BankRepository {

    Bank save(Bank bank);

    void delete(Integer id);

    List<Bank> findAll();

    Optional<Bank> findById(Integer id);

    Optional<Bank> findByName(String name);

}
