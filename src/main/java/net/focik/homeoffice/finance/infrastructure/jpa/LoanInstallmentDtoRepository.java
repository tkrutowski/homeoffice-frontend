package net.focik.homeoffice.finance.infrastructure.jpa;

import net.focik.homeoffice.finance.infrastructure.dto.LoanInstallmentDbDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


interface LoanInstallmentDtoRepository extends JpaRepository<LoanInstallmentDbDto, Integer> {

    @Query(value = "select * from rata_kredytu where id_kredytu = ?1 AND  termin_platnosci like ?2%",
            nativeQuery = true)
    List<LoanInstallmentDbDto> findAllByIdLoanAndDate(Integer idLoan, String data);

    List<LoanInstallmentDbDto> findAllByIdLoan(Integer idLoan);

    void deleteByIdLoan(Integer integer);
}
