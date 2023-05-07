package net.focik.homeoffice.finance.infrastructure.jpa;

import net.focik.homeoffice.finance.infrastructure.dto.PurchaseDbDto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

interface PurchaseDtoRepository extends JpaRepository<PurchaseDbDto, Integer> {

    Optional<PurchaseDbDto> findAllByIdUser(Integer idUser);
}
