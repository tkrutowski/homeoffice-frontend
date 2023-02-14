package net.focik.homeoffice.goahead.api;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.focik.homeoffice.goahead.api.dto.BasicDto;
import net.focik.homeoffice.goahead.api.dto.InvoiceDto;
import net.focik.homeoffice.goahead.api.dto.PaymentTypeDto;
import net.focik.homeoffice.goahead.api.mapper.ApiInvoiceMapper;
import net.focik.homeoffice.goahead.domain.invoice.Invoice;
import net.focik.homeoffice.goahead.domain.invoice.InvoiceFacade;
import net.focik.homeoffice.goahead.domain.invoice.InvoicePdf;
import net.focik.homeoffice.goahead.domain.invoice.port.primary.AddInvoiceUseCase;
import net.focik.homeoffice.goahead.domain.invoice.port.primary.DeleteInvoiceUseCase;
import net.focik.homeoffice.goahead.domain.invoice.port.primary.GetInvoiceUseCase;
import net.focik.homeoffice.goahead.domain.invoice.port.primary.UpdateInvoiceUseCase;
import net.focik.homeoffice.utils.exceptions.HttpResponse;
import net.focik.homeoffice.utils.share.PaymentStatus;
import net.focik.homeoffice.utils.share.PaymentType;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static net.focik.homeoffice.utils.privileges.PrivilegeHelper.*;
import static org.springframework.http.HttpStatus.OK;

@Log4j2
@RestController
@AllArgsConstructor
@RequestMapping("/api/goahead/invoice")
@CrossOrigin
public class InvoiceController {

    private final GetInvoiceUseCase getInvoiceUseCase;
    private final AddInvoiceUseCase addInvoiceUseCase;
    private final UpdateInvoiceUseCase updateInvoiceUseCase;
    private final DeleteInvoiceUseCase deleteInvoiceUseCase;
    private final ApiInvoiceMapper mapper;

    @GetMapping("/{id}")
    ResponseEntity<InvoiceDto> getById(@PathVariable int id,
                                       @RequestHeader(name = AUTHORITIES, required = false) String[] roles) {

        log.info("Try find invoice by id: " + id);
        final List<String> accessRole = List.of(ROLE_ADMIN, GO_INVOICE_READ_ALL);

//        if (PrivilegeHelper.dontHaveAccess(List.of(roles), accessRole)) {
//            throw new AccessDeniedException();
//        }

        Invoice invoice = getInvoiceUseCase.findById(id);

        log.info(invoice != null ? "Found invoice for id = " + id : "Not found invoice for id = " + id);

        if (invoice == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        return new ResponseEntity<>(mapper.toDto(invoice), HttpStatus.OK);
    }

    @GetMapping("/pdf/{id}")
    ResponseEntity<?> getPdfById(@PathVariable int id,
                                 @RequestHeader(name = AUTHORITIES, required = false) String[] roles) {

        log.info("Try download invoice by id: " + id);
        final List<String> accessRole = List.of(ROLE_ADMIN, GO_INVOICE_READ_ALL);

//        if (PrivilegeHelper.dontHaveAccess(List.of(roles), accessRole)) {
//            throw new AccessDeniedException();
//        }
        Invoice invoice = getInvoiceUseCase.findFullById(id);
        String fileName = InvoicePdf.createPdf(invoice);
        Resource resource;
        try {
            Path path = Path.of(fileName);
            resource = new UrlResource(path.toUri());
        } catch (IOException e) {
            return response(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }

        String contentType = "application/octet-stream";
        String headerValue = "attachment; filename=\"" + resource.getFilename() + "\"";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                .body(resource);
    }

    @GetMapping("/number/{year}")
    ResponseEntity<Integer> getInvoiceNumber(@PathVariable int year,
                                             @RequestHeader(name = AUTHORITIES, required = false) String[] roles) {

        log.info("Try get new invoice number");
        final List<String> accessRole = List.of(ROLE_ADMIN, GO_INVOICE_READ_ALL);

//        if (PrivilegeHelper.dontHaveAccess(List.of(roles), accessRole)) {
//            throw new AccessDeniedException();
//        }

        int newInvoiceNumber = getInvoiceUseCase.getNewInvoiceNumber(year);

        log.info(newInvoiceNumber != 0 ? "New invoice number = " + newInvoiceNumber : "Not found new invoice number");

        return new ResponseEntity<>(newInvoiceNumber, HttpStatus.OK);
    }


    @GetMapping()
    ResponseEntity<List<InvoiceDto>> getAllInvoices(@RequestParam PaymentStatus status,
                                                    @RequestHeader(name = AUTHORITIES, required = false) String[] roles) {
        log.info("Try find all invoices by PaymentStatus = " + status);
        final List<String> accessRole = List.of(ROLE_ADMIN, GO_INVOICE_READ_ALL);

//        if (PrivilegeHelper.dontHaveAccess(List.of(roles), accessRole)) {
//            throw new AccessDeniedException();
//        }

        List<Invoice> invoices;
        invoices = getInvoiceUseCase.findAllBy(status, true, true);
        log.info("Found " + invoices.size() + " invoices.");

        return new ResponseEntity<>(invoices.stream()
                .map(invoice -> mapper.toDto(invoice))
                .collect(Collectors.toList()), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Integer> addInvoice(@RequestBody InvoiceDto invoiceDto,
                                              @RequestHeader(name = AUTHORITIES, required = false) String[] roles) {
        log.info("Try add new invoice.");
        final List<String> accessRole = List.of(ROLE_ADMIN, GO_INVOICE_WRITE_ALL);

//        if (PrivilegeHelper.dontHaveAccess(List.of(roles), accessRole)) {
//            throw new AccessDeniedException();
//        }

        Invoice invoice = mapper.toDomain(invoiceDto);
        Integer result = addInvoiceUseCase.addInvoice(invoice);

        log.info(result > 0 ? "Invoice added with id = " + result : "No invoice added!");

        if (result <= 0)
            return new ResponseEntity<>(0, HttpStatus.BAD_REQUEST);

        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<InvoiceDto> updateInvoice(@RequestBody InvoiceDto invoiceDto,
                                                    @RequestHeader(name = AUTHORITIES, required = false) String[] roles) {
        log.info("Try update invoice.");
        final List<String> accessRole = List.of(ROLE_ADMIN, GO_INVOICE_WRITE_ALL);

//        if (PrivilegeHelper.dontHaveAccess(List.of(roles), accessRole)) {
//            throw new AccessDeniedException();
//        }

        Invoice invoice = updateInvoiceUseCase.updateInvoice(mapper.toDomain(invoiceDto));
        return new ResponseEntity<>(mapper.toDto(invoice), OK);
    }

    @DeleteMapping("/{idInvoice}")
    public ResponseEntity<HttpResponse> deleteEmployee(@PathVariable int idInvoice,
                                                       @RequestHeader(name = AUTHORITIES, required = false) String[] roles) {
        log.info("Try delete invoice with id: " + idInvoice);
        final List<String> accessRole = List.of(ROLE_ADMIN, GO_INVOICE_DELETE_ALL);

//        if (PrivilegeHelper.dontHaveAccess(List.of(roles), accessRole)) {
//            throw new AccessDeniedException();
//        }

        deleteInvoiceUseCase.deleteInvoice(idInvoice);

        log.info("Deleted invoice with id = " + idInvoice);

        return response(HttpStatus.NO_CONTENT, "Faktura usunięty.");
    }


    @PutMapping("/paymentstatus/{id}")
    public ResponseEntity<HttpResponse> updateEmploymentStatus(@PathVariable int id, @RequestBody BasicDto basicDto,
                                                               @RequestHeader(name = AUTHORITIES, required = false) String[] roles) {
        log.info("Try update payment status.");

        final List<String> accessRole = List.of(ROLE_ADMIN, GO_INVOICE_WRITE_ALL);

//        if (PrivilegeHelper.dontHaveAccess(List.of(roles), accessRole)) {
//            throw new AccessDeniedException();
//        }

        updateInvoiceUseCase.updatePaymentStatus(id, PaymentStatus.valueOf(basicDto.getValue()));
        return response(HttpStatus.OK, "Zaaktualizowano status pracownika.");
    }

    @GetMapping("/paymenttype")
    ResponseEntity<List<PaymentTypeDto>> getPaymentTypes() {

        PaymentType[] collect = (PaymentType.values());

        List<PaymentTypeDto> paymentTypeDtos = Arrays.stream(collect)
                .map(type -> new PaymentTypeDto(type.name(), type.getViewValue()))
                .collect(Collectors.toList());
        return new ResponseEntity<>(paymentTypeDtos, OK);
    }

//    @GetMapping("/download")
//    public ResponseEntity<?> downloadFile(@RequestParam Integer idInvoice,
//                                          @RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date,
//                                          @RequestHeader(name = AUTHORITIES, required = false) String[] roles) {
//
//        log.info("Try download invoice {}", printTypePdf, date);
//        List<String> accessRole = null;
//        switch (printTypePdf) {
//            case TIME_SHEET:
//            case ATTENDANCE:
//                accessRole = List.of(ROLE_ADMIN, HR_WORKTIME_READ_ALL);
//                break;
//            case WORK_SHEET:
//                break;
//            default:
//                throw new IllegalStateException("Unexpected value: " + printTypePdf);
//        }
//
//        if (PrivilegeHelper.dontHaveAccess(List.of(roles), accessRole)) {
//            throw new AccessDeniedException();
//        }
//        String fileName = printWorkTimeUseCase.createPdf(idEmployees, date, printTypePdf);
//
//        Resource resource;
//        try {
//            Path path = Path.of(fileName);
//            resource = new UrlResource(path.toUri());
//        } catch (IOException e) {
//            return response(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
//        }
//
//        String contentType = "application/octet-stream";
//        String headerValue = "attachment; filename=\"" + resource.getFilename() + "\"";
//
//        return ResponseEntity.ok()
//                .contentType(MediaType.parseMediaType(contentType))
//                .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
//                .body(resource);
//    }

    private ResponseEntity<HttpResponse> response(HttpStatus status, String message) {
        HttpResponse body = new HttpResponse(status.value(), status, status.getReasonPhrase(), message);
        return new ResponseEntity<>(body, status);
    }
}
