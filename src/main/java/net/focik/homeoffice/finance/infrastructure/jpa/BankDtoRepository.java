package net.focik.homeoffice.finance.infrastructure.jpa;

import net.focik.homeoffice.finance.infrastructure.dto.BankDbDto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

interface BankDtoRepository extends JpaRepository<BankDbDto, Integer> {

    Optional<BankDbDto> findByName(String name);
}
