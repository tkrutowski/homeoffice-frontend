package net.focik.homeoffice.finance.api;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.focik.homeoffice.finance.api.dto.BasicDto;
import net.focik.homeoffice.finance.api.dto.LoanDto;
import net.focik.homeoffice.finance.api.dto.LoanInstallmentDto;
import net.focik.homeoffice.finance.api.mapper.ApiLoanMapper;
import net.focik.homeoffice.finance.domain.loan.Loan;
import net.focik.homeoffice.finance.domain.loan.LoanInstallment;
import net.focik.homeoffice.finance.domain.loan.port.primary.AddLoanUseCase;
import net.focik.homeoffice.finance.domain.loan.port.primary.DeleteLoanUseCase;
import net.focik.homeoffice.finance.domain.loan.port.primary.GetLoanUseCase;
import net.focik.homeoffice.finance.domain.loan.port.primary.UpdateLoanUseCase;
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
@RequestMapping("/api/finance/loan")
//@CrossOrigin
class LoanController {

    private final GetLoanUseCase getLoanUseCase;
    private final AddLoanUseCase addLoanUseCase;
    private final UpdateLoanUseCase updateLoanUseCase;
    private final DeleteLoanUseCase deleteLoanUseCase;
    private final ApiLoanMapper apiLoanMapper;


    //
    //LOAN
    //
    @GetMapping("/status")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<List<LoanDto>> getLoansByStatus(@RequestParam(value = "status") PaymentStatus loanStatus,
                                                   @RequestParam(value = "installment") boolean installment) {

        log.info("Get loans with status: " + loanStatus);

        List<Loan> loans = getLoanUseCase.getLoansByStatus(loanStatus, installment);

        return new ResponseEntity<>(loans.stream()
                .map(apiLoanMapper::toDto)
                .collect(Collectors.toList())
                , HttpStatus.OK);
    }

    @GetMapping("/{idLoan}")
        //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<LoanDto> getLoanById(@PathVariable int idLoan) {

        log.info("Get loan by id: " + idLoan);

        Loan loan = getLoanUseCase.getLoanById(idLoan, true);

        return new ResponseEntity<>(apiLoanMapper.toDto(loan), HttpStatus.OK);
    }

    @GetMapping("/{idUser}/status")
        //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<List<LoanDto>> getLoansByEmployeeAndStatus(@PathVariable int idUser,
                                                              @RequestParam(value = "status") PaymentStatus loanStatus,
                                                              @RequestParam(value = "installment") boolean installment) {

        log.info("Get loans for user id: " + idUser);

        List<Loan> loans = getLoanUseCase.getLoansByUser(idUser, loanStatus, installment);

        return new ResponseEntity<>(loans.stream()
                .map(apiLoanMapper::toDto)
                .collect(Collectors.toList())
                , HttpStatus.OK);
    }

    @PostMapping
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<LoanDto> addLoan(@RequestBody LoanDto loanDto) {
        log.info("Try add new loan.");

        Loan loan = apiLoanMapper.toDomain(loanDto);
        Loan result = addLoanUseCase.addLoan(loan);

        log.info("Loan added with id = " + result.getId());

        return new ResponseEntity<>(apiLoanMapper.toDto(result), HttpStatus.CREATED);
    }

    @PutMapping
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<LoanDto> updateLoan(@RequestBody LoanDto loanDto) {
        log.info("Try update loan.");

        Loan loan = apiLoanMapper.toDomain(loanDto);
        Loan result = updateLoanUseCase.updateLoan(loan);

        log.info("Loan updated with id = " + result.getId());

        return new ResponseEntity<>(apiLoanMapper.toDto(result), HttpStatus.CREATED);
    }

    @PutMapping("/status/{id}")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<HttpResponse> updateLoanStatus(@PathVariable int id, @RequestBody BasicDto basicDto) {
        log.info("Try update employment status.");

        updateLoanUseCase.updateLoanStatus(id, PaymentStatus.valueOf(basicDto.getValue()));
        return response(HttpStatus.OK, "Zaaktualizowano status kredytu.");
    }

    @DeleteMapping("/{idLoan}")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<HttpResponse> deleteLoan(@PathVariable int idLoan) {
        log.info("Try to delete loan with id: " + idLoan);

        deleteLoanUseCase.deleteLoanById(idLoan);

        log.info("Deleted loan with id = " + idLoan);

        return response(HttpStatus.NO_CONTENT, "Pożyczka usunięta.");
    }

    //-----------------------------------------------------------------------------------------------------------
    //LOAN INSTALLMENT
    //
    @GetMapping("/installment/{idUser}/all")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<List<LoanInstallmentDto>> getLoanInstallmentByUserAndDate(@PathVariable int idUser,
                                                                             @RequestParam(value = "date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {

        log.info("Get all loan installment by date for employee id: " + idUser);

        List<LoanInstallment> loanInstallments = new ArrayList<>(getLoanUseCase.getLoanInstallments(idUser, date));

        return new ResponseEntity<>(loanInstallments.stream()
                .map(apiLoanMapper::toDto)
                .collect(Collectors.toList())
                , HttpStatus.OK);
    }

    @GetMapping("/installment/{idLoan}")
        //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<List<LoanInstallmentDto>> getLoanInstallmentsByLoan(@PathVariable int idLoan) {

        log.info("Get all loan installment by loan id: " + idLoan);

        List<LoanInstallment> loanInstallments = getLoanUseCase.getLoanInstallments(idLoan);

        return new ResponseEntity<>(loanInstallments.stream()
                .map(apiLoanMapper::toDto)
                .collect(Collectors.toList())
                , HttpStatus.OK);
    }

    @PostMapping("/installment")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<LoanInstallmentDto> addLoanInstallment(@RequestBody LoanInstallmentDto loanInstallmentDto) {
        log.info("Try add new loan installment.");

        LoanInstallment loanInstallment = apiLoanMapper.toDomain(loanInstallmentDto);
        LoanInstallment result = addLoanUseCase.addLoanInstallment(loanInstallment);

        log.info("Loan installment added with id = " + result.getIdLoanInstallment());

        return new ResponseEntity<>(apiLoanMapper.toDto(result), HttpStatus.CREATED);
    }

    @PutMapping("/installment")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<LoanInstallmentDto> updateLoanInstallment(@RequestBody LoanInstallmentDto loanInstallmentDto) {
        log.info("Try update loan installment.");

        LoanInstallment loanInstallment = apiLoanMapper.toDomain(loanInstallmentDto);
        LoanInstallment result = updateLoanUseCase.updateLoanInstallment(loanInstallment);

        log.info("Loan installment updated with id = " + result.getIdLoanInstallment());

        return new ResponseEntity<>(apiLoanMapper.toDto(result), HttpStatus.CREATED);
    }

    @DeleteMapping("/installment/{idLoanInstallment}")
    //    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    public ResponseEntity<HttpResponse> deleteLoanInstallment(@PathVariable int idLoanInstallment) {
        log.info("Try to delete loan installment with id: " + idLoanInstallment);

        deleteLoanUseCase.deleteLoanInstallmentById(idLoanInstallment);

        log.info("Deleted loan with id = " + idLoanInstallment);

        return response(HttpStatus.NO_CONTENT, "Pożyczka usunięta.");
    }

    private ResponseEntity<HttpResponse> response(HttpStatus status, String message) {
        HttpResponse body = new HttpResponse(status.value(), status, status.getReasonPhrase(), message);
        return new ResponseEntity<>(body, status);
    }
}