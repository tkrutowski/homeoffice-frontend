package net.focik.homeoffice.goahead.domain.invoice.port.primary;

import net.focik.homeoffice.goahead.domain.invoice.Invoice;

public interface AddInvoiceUseCase {
    Integer addInvoice(Invoice invoice);
}
