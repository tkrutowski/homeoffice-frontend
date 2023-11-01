package net.focik.homeoffice.finance.api;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.focik.homeoffice.finance.api.dto.BankDto;
import net.focik.homeoffice.finance.api.mapper.ApiBankMapper;
import net.focik.homeoffice.finance.domain.bank.Bank;
import net.focik.homeoffice.finance.domain.bank.port.primary.AddBankUseCase;
import net.focik.homeoffice.finance.domain.bank.port.primary.DeleteBankUseCase;
import net.focik.homeoffice.finance.domain.bank.port.primary.GetBankUseCase;
import net.focik.homeoffice.finance.domain.bank.port.primary.UpdateBankUseCase;
import net.focik.homeoffice.goahead.api.dto.BasicDto;
import net.focik.homeoffice.goahead.api.dto.CustomerDto;
import net.focik.homeoffice.goahead.api.dto.CustomerTypeDto;
import net.focik.homeoffice.goahead.domain.customer.Customer;
import net.focik.homeoffice.goahead.domain.customer.CustomerStatus;
import net.focik.homeoffice.goahead.domain.customer.CustomerType;
import net.focik.homeoffice.utils.exceptions.ExceptionHandling;
import net.focik.homeoffice.utils.exceptions.HttpResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.OK;

@Log4j2
@RestController
@AllArgsConstructor
@RequestMapping("/api/finance/bank")
//@CrossOrigin
public class BankController extends ExceptionHandling {

    private final ApiBankMapper mapper;
    private final AddBankUseCase addBankUseCase;
    private final UpdateBankUseCase updateBankUseCase;
    private final GetBankUseCase getBankUseCase;
    private final DeleteBankUseCase deleteBankUseCase;


    @GetMapping("/{id}")
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<BankDto> getById(@PathVariable int id,
                                    @RequestParam(required = false) Boolean isAddress ) {

        log.info("Try find bank by id: " + id);

        Bank bank = getBankUseCase.findById(id, isAddress);

        log.info(bank != null ? "Found bank for id = " + id : "Not found bank for id = " + id);

        if (bank == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        return new ResponseEntity<>(mapper.toDto(bank), OK);
    }

    @GetMapping()
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<List<BankDto>> getAll(@RequestParam(required = false) Boolean address) {
        log.info("Try get all banks - Address = " + address);

        List<Bank> bankList = getBankUseCase.findByAll(address);

        log.info("Found " + bankList.size() + " banks.");

        return new ResponseEntity<>(bankList.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList()), OK);
    }

    @PostMapping
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_WRITE_ALL')")
    public ResponseEntity<BankDto> addBank(@RequestBody BankDto bankDto) {
        log.info("Try add new bank.");

        Bank bank = mapper.toDomain(bankDto);
        Bank result = addBankUseCase.addBank(bank);

        log.info(result.getId() > 0 ? "Bank added with id = " + result : "No bank added!");

        if (result.getId() <= 0)
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(mapper.toDto(result), HttpStatus.CREATED);
    }

    @PutMapping
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_WRITE_ALL')")
    public ResponseEntity<BankDto> updateBank(@RequestBody BankDto bankDto) {
        log.info("Try update bank with id: {}", bankDto.getId());

        Bank bank = updateBankUseCase.updateBank(mapper.toDomain(bankDto));
        return new ResponseEntity<>(mapper.toDto(bank), OK);
    }

    @DeleteMapping("/{idBank}")
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_DELETE_ALL')")
    public ResponseEntity<HttpResponse> deleteBank(@PathVariable int idBank) {
        log.info("Try delete bank with id: " + idBank);

        deleteBankUseCase.deleteBank(idBank);

        log.info("Deleted bank with id = " + idBank);

        return response(HttpStatus.NO_CONTENT, "Bank usunięty.");
    }

    private ResponseEntity<HttpResponse> response(HttpStatus status, String message) {
        HttpResponse body = new HttpResponse(status.value(), status, status.getReasonPhrase(), message);
        return new ResponseEntity<>(body, status);
    }
}
