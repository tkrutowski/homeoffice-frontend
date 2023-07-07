package net.focik.homeoffice.finance.domain.fee;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.finance.domain.exception.LoanInstallmentNotFoundException;
import net.focik.homeoffice.finance.domain.exception.LoanNotFoundException;
import net.focik.homeoffice.finance.domain.exception.LoanNotValidException;
import net.focik.homeoffice.finance.domain.fee.port.secondary.FeeRepository;
import net.focik.homeoffice.utils.MoneyUtils;
import net.focik.homeoffice.utils.share.PaymentStatus;
import org.javamoney.moneta.Money;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
class FeeService {

    private final FeeRepository feeRepository;

    //-----------------------------FEE---------------------------


    Fee saveFee(Fee fee) {
        if (isNotValid(fee))
            throw new LoanNotValidException();
        Fee saved = feeRepository.saveFee(fee);
        List<FeeInstallment> feeInstallments = new ArrayList<>();
        for (long i = 1; i <= saved.getNumberOfPayments(); i++) {
            feeInstallments.add(FeeInstallment.builder()
                    .idFee(saved.getId())
                    .installmentAmountToPay(fee.getAmount())
                    .installmentAmountPaid(BigDecimal.ZERO)
                    .paymentDeadline(fee.getFirstPaymentDate().plusMonths(fee.getFeeFrequency().getFrequencyNumber() * i))
                    .paymentStatus(PaymentStatus.TO_PAY)
                    .build());
        }
        List<FeeInstallment> savedFeeInstallments = addFeeInstallment(feeInstallments);
        saved.setInstallments(savedFeeInstallments);
        return saved;
    }

    public FeeInstallment addFeeInstallment(FeeInstallment feeInstallment) {
        return feeRepository.saveFeeInstallment(feeInstallment);
    }

    public List<FeeInstallment> addFeeInstallment(List<FeeInstallment> feeInstallment) {
        return feeRepository.saveFeeInstallment(feeInstallment);
    }

    List<Fee> findFeesByUser(int idUser, PaymentStatus paymentStatus, boolean withFeeInstallment) {
        List<Fee> feeByUserId = feeRepository.findFeeByUserId(idUser);

        if (withFeeInstallment) {
            for (Fee l : feeByUserId) {
                List<FeeInstallment> feeInstallmentByFeeId = findFeeInstallmentByFeeId(l.getId());
                l.addFeeInstallment(feeInstallmentByFeeId);
            }
        }

        if (paymentStatus == null || paymentStatus.equals(PaymentStatus.ALL))
            return feeByUserId;

        feeByUserId = feeByUserId.stream()
                .filter(fee -> fee.getFeeStatus().equals(paymentStatus))
                .collect(Collectors.toList());

        return feeByUserId;
    }

    List<FeeInstallment> findFeeInstallmentByFeeId(int idFee) {
        return feeRepository.findFeeInstallmentByFeeId(idFee);
    }

    List<FeeInstallment> getFeeInstallments(Integer idUser, LocalDate date) {
        List<Fee> feesByUser = findFeesByUser(idUser, null, true);
        return feesByUser.stream()
                .map(Fee::getInstallments)
                .flatMap(Collection::stream)
                .filter(loanInstallment -> loanInstallment.getPaymentDeadline().getYear() == (date.getYear()))
                .filter(loanInstallment -> loanInstallment.getPaymentDeadline().getMonth().equals(date.getMonth()))
                .collect(Collectors.toList());
    }

    Fee findFeeById(int idFee, boolean withFeeInstallment) {
        Optional<Fee> feeById = feeRepository.findFeeById(idFee);

        if (feeById.isEmpty()) {
            throw new LoanNotFoundException(idFee);
        }

        if (withFeeInstallment) {
            List<FeeInstallment> feeInstallmentList = findFeeInstallmentByFeeId(feeById.get().getId());
            feeById.get().addFeeInstallment(feeInstallmentList);
        }

        return feeById.get();
    }

    List<Fee> findFeesByStatus(PaymentStatus paymentStatus, boolean withInstallment) {
        List<Fee> feeList = feeRepository.findAll();

        if (withInstallment) {
            for (Fee fee : feeList) {
                List<FeeInstallment> feeInstallmentList = findFeeInstallmentByFeeId(fee.getId());
                fee.addFeeInstallment(feeInstallmentList);
            }
        }

        if (paymentStatus == null || PaymentStatus.ALL.equals(paymentStatus))
            return feeList;

        feeList = feeList.stream()
                .filter(loan -> loan.getFeeStatus().equals(paymentStatus))
                .collect(Collectors.toList());

        return feeList;
    }

    @Transactional
    public void deleteFee(int idFee) {
        feeRepository.deleteFeeInstallmentByIdFee(idFee);
        feeRepository.deleteFeeById(idFee);
    }

    public void updateFee(Fee fee) {
        if (isNotValid(fee))
            throw new LoanNotValidException();
        feeRepository.saveFee(fee);
    }

    public FeeInstallment updateFeeInstallment(FeeInstallment feeInstallment) {
        if (isNotValid(feeInstallment))
            throw new LoanNotValidException();
        return feeRepository.saveFeeInstallment(feeInstallment);
    }

    public void deleteFeeInstallment(int id) {
        feeRepository.deleteFeeInstallmentById(id);
    }

    private boolean isNotValid(Fee fee) {
        if (Objects.equals(fee.getAmount(), BigDecimal.ZERO))
            return true;
        return fee.getDate() == null;
    }

    private boolean isNotValid(FeeInstallment feeInstallment) {
        if (Objects.equals(feeInstallment.getInstallmentAmountPaid(), BigDecimal.ZERO))
            return true;
        return feeInstallment.getPaymentDate() == null;
    }

    public Money getFeeToPaySum(Integer idUser) {
        List<Fee> feeList = findFeesByUser(idUser, PaymentStatus.TO_PAY, true);
        Money result = Money.of(BigDecimal.ZERO, "PLN");

        for (Fee fee : feeList) {
            Money feeAmount = MoneyUtils.mapToMoney(fee.getAmount());
            BigDecimal reduce = fee.getInstallments().stream()
                    .map(FeeInstallment::getInstallmentAmountToPay)
                    .reduce(BigDecimal::add)
                    .orElse(BigDecimal.ZERO);
            Money feeInstallmentPayedOff = Money.of(reduce, "PLN");
            result = result.add(feeAmount.subtract(feeInstallmentPayedOff));
        }

        return result;
    }

    public FeeInstallment getFeeInstallment(int idFeeInstallment) {
        Optional<FeeInstallment> installmentById = feeRepository.findFeeInstallmentById(idFeeInstallment);

        if (installmentById.isEmpty()) {
            throw new LoanInstallmentNotFoundException(idFeeInstallment);
        }
        return installmentById.get();
    }
}
