package net.focik.homeoffice.goahead.domain.invoice;

import net.focik.homeoffice.goahead.domain.customer.Customer;
import net.focik.homeoffice.goahead.domain.invoice.port.secondary.InvoiceRepository;
import net.focik.homeoffice.goahead.infrastructure.inMemory.InMemoryInvoiceRepositoryAdapter;
import net.focik.homeoffice.utils.MoneyUtils;
import net.focik.homeoffice.utils.share.PaymentStatus;
import net.focik.homeoffice.utils.share.PaymentType;
import org.javamoney.moneta.Money;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InvoiceFacadeTest {

    static InvoiceRepository repository = new InMemoryInvoiceRepositoryAdapter();
    static InvoiceService service = new InvoiceService(repository, null);
    static InvoiceFacade facade = new InvoiceFacade(service);

    static Integer id = 0;

    @BeforeAll
    static void setUp() {
            id = facade.addInvoice(createInvoice());
    }

    @Test
    void should_return_id_added_invoice() {
        //given

        //when
        Integer result = facade.addInvoice(createInvoice2());
        Invoice byId = facade.findById(result);

        //then
        assertTrue(result > 0);
        assertTrue(byId.getInvoiceItems().size() == 2);

    }

    @Test
    void should_return_correct_invoice_ById() {
        //given
        Invoice byId = facade.findById(id);

        //when
        Money result = byId.getInvoiceItems().stream()
                .map(invoiceItem -> invoiceItem.getAmount().multiply(invoiceItem.getQuantity()))
                .reduce(Money.of(BigDecimal.ZERO, "PLN"), Money::add);

        //then
        assertTrue(byId.getInvoiceItems().size() == 2);
        assertEquals(PaymentType.TRANSFER, byId.getPaymentType());
        assertEquals(LocalDate.of(2022, 9, 1), byId.getInvoiceDate());
        assertEquals(LocalDate.of(2022, 9, 5), byId.getSellDate());
//        assertEquals(Money.of(BigDecimal.valueOf(Double.parseDouble("1259.96")),"PLN").getNumber(), byId.getAmount().getNumber());
        assertEquals(PaymentStatus.TO_PAY, byId.getPaymentStatus());
        assertEquals(LocalDate.of(2022, 9, 15), byId.getPaymentDate());
        assertEquals(PaymentType.TRANSFER, byId.getPaymentType());
        assertEquals(MoneyUtils.mapMoneyToString(Money.of(BigDecimal.valueOf(Double.parseDouble("1259.96")), "PLN")),
                MoneyUtils.mapMoneyToString(result));
    }

    private static Invoice createInvoice() {
        return Invoice.builder()
                .customer(Customer.builder().id(1).build())
                .paymentType(PaymentType.TRANSFER)
                .invoiceDate(LocalDate.of(2022, 9, 1))
                .sellDate(LocalDate.of(2022, 9, 5))
                .amount(Money.of(BigDecimal.valueOf(Double.parseDouble("1259.96")), "PLN"))
                .paymentStatus(PaymentStatus.TO_PAY)
                .paymentDate(LocalDate.of(2022, 9, 15))
                .invoiceNumber("2023/1")
                .invoiceItems(Arrays.asList(InvoiceItem.builder()
                                .name("MEL")
                                .pkwiu("testPKWIU")
                                .unit("szt")
                                .quantity(24.68f)
                                .amount(Money.of(BigDecimal.valueOf(Double.parseDouble("47")), "PLN"))
                                .build(),
                        InvoiceItem.builder()
                                .name("MEL")
                                .pkwiu("testPKWIU")
                                .unit("szt")
                                .quantity(2f)
                                .amount(Money.of(BigDecimal.valueOf(Double.parseDouble("50")), "PLN"))
                                .build()))
                .build();
    }

    private Invoice createInvoice2() {
        return Invoice.builder()
                .customer(Customer.builder().id(2).build())
                .paymentType(PaymentType.TRANSFER)
                .invoiceDate(LocalDate.of(2022, 9, 3))
                .sellDate(LocalDate.of(2022, 9, 3))
                .amount(Money.of(BigDecimal.valueOf(Double.parseDouble("1260")), "PLN"))
                .paymentStatus(PaymentStatus.TO_PAY)
                .paymentDate(LocalDate.of(2022, 9, 17))
                .invoiceNumber("2023/2")
                .invoiceItems(Arrays.asList(InvoiceItem.builder()
                                .name("Kurs 60 min")
                                .pkwiu("testPKWIU")
                                .unit("szt")
                                .quantity(6f)
                                .amount(Money.of(BigDecimal.valueOf(Double.parseDouble("90")), "PLN"))
                                .build(),
                        InvoiceItem.builder()
                                .name("Kurs ind1")
                                .pkwiu("testPKWIU")
                                .unit("szt")
                                .quantity(4f)
                                .amount(Money.of(BigDecimal.valueOf(Double.parseDouble("90")), "PLN"))
                                .build()))
                .build();
    }
}