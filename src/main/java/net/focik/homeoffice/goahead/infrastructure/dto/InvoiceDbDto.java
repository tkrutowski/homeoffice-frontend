package net.focik.homeoffice.goahead.infrastructure.dto;

import lombok.*;
import net.focik.homeoffice.goahead.domain.invoice.InvoiceItem;
import net.focik.homeoffice.utils.share.PaymentStatus;
import net.focik.homeoffice.utils.share.PaymentType;
import org.javamoney.moneta.Money;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "invoice")
public class InvoiceDbDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer idInvoice;
    private Integer idCustomer;
    private String number;
    private BigDecimal amount;//brutto
    private LocalDate sellDate;//data sprzedaży
    private LocalDate invoiceDate;//data faktury
    private LocalDate paymentDate;//termin zapłaty
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;
    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;
    private String otherInfo;
}
