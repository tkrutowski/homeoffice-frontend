package net.focik.homeoffice.goahead.infrastructure.dto;

import lombok.*;
import org.javamoney.moneta.Money;

import javax.persistence.*;
import java.math.BigDecimal;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "invoice_item")
public class InvoiceItemDbDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long idInvoiceItem;
    private Integer idInvoice;
    private String name;
    private String pkwiu;
    private String unit;
    private Float quantity;
    private BigDecimal amount;//brutto
}
