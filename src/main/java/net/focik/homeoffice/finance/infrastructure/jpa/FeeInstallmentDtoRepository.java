package net.focik.homeoffice.finance.infrastructure.jpa;

import net.focik.homeoffice.finance.infrastructure.dto.FeeInstallmentDbDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


interface FeeInstallmentDtoRepository extends JpaRepository<FeeInstallmentDbDto, Integer> {

    @Query(value = "select * from rata_oplaty where id_oplaty = ?1 AND  termin_platnosci like ?2%",
            nativeQuery = true)
    List<FeeInstallmentDbDto> findAllByIdFeeAndDate(Integer idFee, String data);

    List<FeeInstallmentDbDto> findAllByIdFee(Integer idFee);

    void deleteByIdFee(Integer integer);
}
