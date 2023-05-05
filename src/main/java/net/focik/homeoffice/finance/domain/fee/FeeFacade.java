package net.focik.homeoffice.finance.domain.fee;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.finance.domain.fee.port.primary.AddFeeUseCase;
import net.focik.homeoffice.finance.domain.fee.port.primary.DeleteFeeUseCase;
import net.focik.homeoffice.finance.domain.fee.port.primary.GetFeeUseCase;
import net.focik.homeoffice.finance.domain.fee.port.primary.UpdateFeeUseCase;
import net.focik.homeoffice.utils.share.PaymentStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor
@Component
public class FeeFacade implements AddFeeUseCase, GetFeeUseCase, UpdateFeeUseCase, DeleteFeeUseCase {

    FeeService feeService;

    @Override
    public Fee addFee(Fee fee) {
        return feeService.saveFee(fee);
    }

    @Override
    public FeeInstallment addFeeInstallment(FeeInstallment feeInstallment) {
        return feeService.addFeeInstallment(feeInstallment);
    }

    @Override
    public FeeInstallment getFeeInstallment(int idFeeInstallment) {
        return feeService.getFeeInstallment(idFeeInstallment);
    }

    @Override
    public Fee getFeeById(int idFee, boolean withInstallment) {
        return feeService.findFeeById(idFee, withInstallment);
    }

    @Override
    public List<Fee> getFeesByUser(int idUser, PaymentStatus paymentStatus, boolean withInstallment) {
        return feeService.findFeesByUser(idUser, paymentStatus, withInstallment);
    }

    @Override
    public List<Fee> getFeesByUser(int idUser, boolean withInstallment) {
        return feeService.findFeesByUser(idUser, null, withInstallment);
    }

    @Override
    public List<Fee> getFeesByStatus(PaymentStatus paymentStatus, boolean withInstallment) {
        return feeService.findFeesByStatus(paymentStatus, withInstallment);
    }

    @Override
    public List<FeeInstallment> getFeeInstallments(int idUser, LocalDate date) {
        return feeService.getFeeInstallments(idUser, date);
    }

    @Override
    public List<FeeInstallment> getFeeInstallments(int idFee) {
        return feeService.findFeeById(idFee, true).getFeeInstallments();
    }

    @Override
    public Fee updateFee(Fee fee) {
        return feeService.saveFee(fee);
    }

    @Override
    public FeeInstallment updateFeeInstallment(FeeInstallment feeInstallment) {
        return feeService.updateFeeInstallment(feeInstallment);
    }

    @Override
    public void updateFeeStatus(int idFee, PaymentStatus paymentStatus) {
        Fee fee = feeService.findFeeById(idFee, false);
        fee.changeFeeStatus(paymentStatus);

        feeService.updateFee(fee);
    }

    @Override
    public void deleteFeeById(int idFee) {
        feeService.deleteFee(idFee);
    }

    @Override
    public void deleteFeeInstallmentById(int id) {
        feeService.deleteFeeInstallment(id);
    }

//
//    public Money getInstallmentLoansSumByIdUserAndDate(int idUser, LocalDate date) {
//        return loanService.getInstallmentLoansSumByIdEmployeeAndDate(idUser, date);
//    }
//
//    public Money getLoansToPaySum(Integer employeeId) {
//        return loanService.getLoansToPaySum(employeeId);
//    }
}
