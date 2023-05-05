package net.focik.homeoffice.finance.infrastructure.jpa;

import net.focik.homeoffice.finance.infrastructure.dto.FirmDbDto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

interface FirmDtoRepository extends JpaRepository<FirmDbDto, Integer> {

    Optional<FirmDbDto> findByName(String name);
}
