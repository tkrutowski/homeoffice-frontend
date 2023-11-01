package net.focik.homeoffice.finance.api;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.focik.homeoffice.finance.domain.payment.Payment;
import net.focik.homeoffice.finance.domain.payment.PaymentFacade;
import net.focik.homeoffice.utils.share.PaymentStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Log4j2
@RestController
@AllArgsConstructor
@RequestMapping("/api/finance/payment")
//@CrossOrigin
class PaymentController {

    PaymentFacade paymentFacade;

    @GetMapping()
    @PreAuthorize("hasAnyAuthority('FINANCE_PAYMENT_READ', 'FINANCE_PAYMENT_READ_ALL', 'ROLE_ADMIN')")
    ResponseEntity<Map<Integer, List<Payment>>> getPaymentsByYear(@RequestParam(value = "date", required = false) String date,
                                                                  @RequestParam(value = "status", defaultValue = "TO_PAY") PaymentStatus status) {
        int year = date == null ? LocalDate.now().getYear() : Integer.parseInt(date);

        log.info("Get payments for: " + year);

        Map<Integer, List<Payment>> paymentsByDate = paymentFacade.getPaymentsByDate(LocalDate.of(year, 1, 1), status);

        return new ResponseEntity<>(paymentsByDate, HttpStatus.OK);
    }
}