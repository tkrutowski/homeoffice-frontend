package net.focik.homeoffice.finance.api;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.focik.homeoffice.finance.api.dto.FirmDto;
import net.focik.homeoffice.finance.api.mapper.ApiFirmMapper;
import net.focik.homeoffice.finance.domain.firm.Firm;
import net.focik.homeoffice.finance.domain.firm.port.primary.AddFirmUseCase;
import net.focik.homeoffice.finance.domain.firm.port.primary.DeleteFirmUseCase;
import net.focik.homeoffice.finance.domain.firm.port.primary.GetFirmUseCase;
import net.focik.homeoffice.finance.domain.firm.port.primary.UpdateFirmUseCase;
import net.focik.homeoffice.utils.exceptions.ExceptionHandling;
import net.focik.homeoffice.utils.exceptions.HttpResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.OK;

@Log4j2
@RestController
@AllArgsConstructor
@RequestMapping("/api/finance/bank")
//@CrossOrigin
public class FirmController extends ExceptionHandling {

    private final ApiFirmMapper mapper;
    private final AddFirmUseCase addFirmUseCase;
    private final UpdateFirmUseCase updateFirmUseCase;
    private final GetFirmUseCase getFirmUseCase;
    private final DeleteFirmUseCase deleteFirmUseCase;


    @GetMapping("/{id}")
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<FirmDto> getById(@PathVariable int id,
                                    @RequestParam(required = false) Boolean isAddress) {

        log.info("Try find firm by id: " + id);

        Firm firm = getFirmUseCase.findById(id, isAddress);

        log.info(firm != null ? "Found firm for id = " + id : "Not found firm for id = " + id);

        if (firm == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        return new ResponseEntity<>(mapper.toDto(firm), OK);
    }

    @GetMapping()
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_READ_ALL')")
    ResponseEntity<List<FirmDto>> getAll(@RequestParam(required = false) Boolean address) {
        log.info("Try get all banks - Address = " + address);

        List<Firm> firmList = getFirmUseCase.findByAll(address);

        log.info("Found " + firmList.size() + " banks.");

        return new ResponseEntity<>(firmList.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList()), OK);
    }

    @PostMapping
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_WRITE_ALL')")
    public ResponseEntity<FirmDto> addFirm(@RequestBody FirmDto firmDto) {
        log.info("Try add new firm.");

        Firm firm = mapper.toDomain(firmDto);
        Firm result = addFirmUseCase.addFirm(firm);

        log.info(result.getId() > 0 ? "Firm added with id = " + result : "No firm added!");

        if (result.getId() <= 0)
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(mapper.toDto(result), HttpStatus.CREATED);
    }

    @PutMapping
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_WRITE_ALL')")
    public ResponseEntity<FirmDto> updateFirm(@RequestBody FirmDto firmDto) {
        log.info("Try update firm with id: {}", firmDto.getId());

        Firm firm = updateFirmUseCase.updateFirm(mapper.toDomain(firmDto));
        return new ResponseEntity<>(mapper.toDto(firm), OK);
    }

    @DeleteMapping("/{idFirm}")
//    @PreAuthorize("hasAnyAuthority('GOAHEAD_DELETE_ALL')")
    public ResponseEntity<HttpResponse> deleteFirm(@PathVariable int idFirm) {
        log.info("Try delete firm with id: " + idFirm);

        deleteFirmUseCase.deleteFirm(idFirm);

        log.info("Deleted firm with id = " + idFirm);

        return response(HttpStatus.NO_CONTENT, "Firma usunięty.");
    }

    private ResponseEntity<HttpResponse> response(HttpStatus status, String message) {
        HttpResponse body = new HttpResponse(status.value(), status, status.getReasonPhrase(), message);
        return new ResponseEntity<>(body, status);
    }
}
