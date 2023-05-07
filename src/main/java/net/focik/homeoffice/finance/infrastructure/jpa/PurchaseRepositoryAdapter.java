package net.focik.homeoffice.finance.infrastructure.jpa;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.finance.domain.loan.Loan;
import net.focik.homeoffice.finance.domain.loan.LoanInstallment;
import net.focik.homeoffice.finance.domain.purchase.Purchase;
import net.focik.homeoffice.finance.domain.purchase.port.secondary.PurchaseRepository;
import net.focik.homeoffice.finance.infrastructure.dto.LoanDbDto;
import net.focik.homeoffice.finance.infrastructure.dto.LoanInstallmentDbDto;
import net.focik.homeoffice.finance.infrastructure.dto.PurchaseDbDto;
import net.focik.homeoffice.finance.infrastructure.mapper.JpaLoanMapper;
import net.focik.homeoffice.finance.infrastructure.mapper.JpaPurchaseMapper;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@Primary
@AllArgsConstructor
class PurchaseRepositoryAdapter implements PurchaseRepository {

    PurchaseDtoRepository purchaseDtoRepository;
    LoanInstallmentDtoRepository loanInstallmentDtoRepository;
    JpaPurchaseMapper mapper;


    @Override
    public Purchase savePurchase(Purchase purchase) {
        PurchaseDbDto saved = purchaseDtoRepository.save(mapper.toDto(purchase));
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Purchase> findPurchaseById(Integer id) {
        Optional<PurchaseDbDto> byId = purchaseDtoRepository.findById(id);
        if (byId.isEmpty())
            return Optional.empty();

        return Optional.of(mapper.toDomain(byId.get()));
    }

    @Override
    public List<Purchase> findPurchaseByUserId(Integer idUser) {
        return purchaseDtoRepository.findAllByIdUser(idUser).stream()
                .map(loanDto -> mapper.toDomain(loanDto))
                .collect(Collectors.toList());
    }

    @Override
    public List<Purchase> findAll() {
        return purchaseDtoRepository.findAll().stream()
                .map(loanDto -> mapper.toDomain(loanDto))
                .collect(Collectors.toList());
    }

    @Override
    public void deletePurchaseById(int idLoan) {
        purchaseDtoRepository.deleteById(idLoan);
    }

}