package net.focik.homeoffice.finance.api;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.focik.homeoffice.finance.api.dto.BasicDto;
import net.focik.homeoffice.finance.api.dto.FeeDto;
import net.focik.homeoffice.finance.api.dto.FeeInstallmentDto;
import net.focik.homeoffice.finance.api.mapper.ApiFeeMapper;
import net.focik.homeoffice.finance.domain.fee.Fee;
import net.focik.homeoffice.finance.domain.fee.FeeInstallment;
import net.focik.homeoffice.finance.domain.fee.port.primary.AddFeeUseCase;
import net.focik.homeoffice.finance.domain.fee.port.primary.DeleteFeeUseCase;
import net.focik.homeoffice.finance.domain.fee.port.primary.GetFeeUseCase;
import net.focik.homeoffice.finance.domain.fee.port.primary.UpdateFeeUseCase;
import net.focik.homeoffice.utils.exceptions.HttpResponse;
import net.focik.homeoffice.utils.share.PaymentStatus;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Log4j2
@RestController
@AllArgsConstructor
@RequestMapping("/api/finance/fee")
//@CrossOrigin
class FeeController {

    private final GetFeeUseCase getFeeUseCase;
    private final AddFeeUseCase addFeeUseCase;
    private final UpdateFeeUseCase updateFeeUseCase;
    private final DeleteFeeUseCase deleteFeeUseCase;
    private final ApiFeeMapper apiFeeMapper;


    //
    //LOAN
    //
    @GetMapping("/status")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<List<FeeDto>> getFeeByStatus(@RequestParam(value = "paymentStatus") PaymentStatus paymentStatus,
                                                  @RequestParam(value = "installment") boolean installment) {

        log.info("Get fee with status: " + paymentStatus);

        List<Fee> feesByStatus = getFeeUseCase.getFeesByStatus(paymentStatus, installment);

        return new ResponseEntity<>(feesByStatus.stream()
                .map(apiFeeMapper::toDto)
                .collect(Collectors.toList())
                , HttpStatus.OK);
    }

    @GetMapping("/{idFee}")
        //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<FeeDto> getFeeById(@PathVariable int idFee) {

        log.info("Get fee by id: " + idFee);

        Fee fee = getFeeUseCase.getFeeById(idFee, true);

        return new ResponseEntity<>(apiFeeMapper.toDto(fee), HttpStatus.OK);
    }

    @GetMapping("/{idUser}/status")
        //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<List<FeeDto>> getLoansByEmployeeAndStatus(@PathVariable int idUser,
                                                              @RequestParam(value = "paymentStatus") PaymentStatus paymentStatus,
                                                              @RequestParam(value = "installment") boolean installment) {

        log.info("Get fees for user id: " + idUser);

        List<Fee> feesByUser = getFeeUseCase.getFeesByUser(idUser, paymentStatus, installment);

        return new ResponseEntity<>(feesByUser.stream()
                .map(apiFeeMapper::toDto)
                .collect(Collectors.toList())
                , HttpStatus.OK);
    }

    @PostMapping
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<FeeDto> addFee(@RequestBody FeeDto feeDto) {
        log.info("Try add new fee.");

        Fee fee = apiFeeMapper.toDomain(feeDto);
        Fee result = addFeeUseCase.addFee(fee);

        log.info("Fee added with id = " + result.getId());

        return new ResponseEntity<>(apiFeeMapper.toDto(result), HttpStatus.CREATED);
    }

    @PutMapping
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<FeeDto> updateFee(@RequestBody FeeDto feeDto) {
        log.info("Try update fee.");

        Fee fee = apiFeeMapper.toDomain(feeDto);
        Fee result = updateFeeUseCase.updateFee(fee);

        log.info("Fee updated with id = " + result.getId());

        return new ResponseEntity<>(apiFeeMapper.toDto(result), HttpStatus.CREATED);
    }

    @PutMapping("/status/{id}")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<HttpResponse> updateLFeeStatus(@PathVariable int id, @RequestBody BasicDto basicDto) {
        log.info("Try update fee status.");

        updateFeeUseCase.updateFeeStatus(id, PaymentStatus.valueOf(basicDto.getValue()));
        return response(HttpStatus.OK, "Zaaktualizowano status opłaty.");
    }

    @DeleteMapping("/{idFee}")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<HttpResponse> deleteFee(@PathVariable int idFee) {
        log.info("Try to delete fee with id: " + idFee);

        deleteFeeUseCase.deleteFeeById(idFee);

        log.info("Deleted fee with id = " + idFee);

        return response(HttpStatus.NO_CONTENT, "Opłata usunięta.");
    }

    //-----------------------------------------------------------------------------------------------------------
    //LOAN INSTALLMENT
    //
    @GetMapping("/installment/{idUser}/all")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<List<FeeInstallmentDto>> getFeeInstallmentByUserAndDate(@PathVariable int idUser,
                                                                            @RequestParam(value = "date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {

        log.info("Get all fee installment by date for user id: " + idUser);

        List<FeeInstallment> feeInstallments = new ArrayList<>(getFeeUseCase.getFeeInstallments(idUser, date));

        return new ResponseEntity<>(feeInstallments.stream()
                .map(apiFeeMapper::toDto)
                .collect(Collectors.toList())
                , HttpStatus.OK);
    }

    @GetMapping("/installment/{idFee}")
        //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<List<FeeInstallmentDto>> getFeeInstallmentsByLoan(@PathVariable int idFee) {

        log.info("Get all fee installment by loan id: " + idFee);

        List<FeeInstallment> feeInstallments = getFeeUseCase.getFeeInstallments(idFee);

        return new ResponseEntity<>(feeInstallments.stream()
                .map(apiFeeMapper::toDto)
                .collect(Collectors.toList())
                , HttpStatus.OK);
    }

    @PostMapping("/installment")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<FeeInstallmentDto> addFeeInstallment(@RequestBody FeeInstallmentDto feeInstallmentDto) {
        log.info("Try add new fee installment.");

        FeeInstallment feeInstallment = apiFeeMapper.toDomain(feeInstallmentDto);
        FeeInstallment result = addFeeUseCase.addFeeInstallment(feeInstallment);

        log.info("Fee installment added with id = " + result.getIdFeeInstallment());

        return new ResponseEntity<>(apiFeeMapper.toDto(result), HttpStatus.CREATED);
    }

    @PutMapping("/installment")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<FeeInstallmentDto> updateFeeInstallment(@RequestBody FeeInstallmentDto feeInstallmentDto) {
        log.info("Try update fee installment.");

        FeeInstallment feeInstallment = apiFeeMapper.toDomain(feeInstallmentDto);
        FeeInstallment result = updateFeeUseCase.updateFeeInstallment(feeInstallment);

        log.info("Fee installment updated with id = " + result.getIdFeeInstallment());

        return new ResponseEntity<>(apiFeeMapper.toDto(result), HttpStatus.CREATED);
    }

    @DeleteMapping("/installment/{idFeeInstallment}")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<HttpResponse> deleteFeeInstallment(@PathVariable int idFeeInstallment) {
        log.info("Try to delete fee installment with id: " + idFeeInstallment);

        deleteFeeUseCase.deleteFeeInstallmentById(idFeeInstallment);

        log.info("Deleted fee with id = " + idFeeInstallment);

        return response(HttpStatus.NO_CONTENT, "Pożyczka usunięta.");
    }

    private ResponseEntity<HttpResponse> response(HttpStatus status, String message) {
        HttpResponse body = new HttpResponse(status.value(), status, status.getReasonPhrase(), message);
        return new ResponseEntity<>(body, status);
    }
}