package net.focik.homeoffice.goahead.api.dto;

import lombok.*;
import org.javamoney.moneta.Money;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class InvoiceItemDto {
    private long id;
    private int idInvoice;
    private String name;
    private String jm;
    private String quantity;
    private String amount;//brutto
    private String amountSum;//brutto
}
