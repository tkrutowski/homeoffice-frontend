package net.focik.homeoffice.finance.infrastructure.dto;

import lombok.*;
import net.focik.homeoffice.utils.share.PaymentStatus;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "rata_pozyczki")
@Getter
@ToString
@Builder
public class LoanInstallmentDbDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_raty")
    private Integer id;
    @Column(name = "id_kredytu")
    private Integer idLoan;
    @Column(name = "nr_raty")
    private Integer installmentNumber;
    @Column(name = "kwota_do_zaplaty")
    private BigDecimal installmentAmountToPay;
    @Column(name = "kwota_zaplacona")
    private BigDecimal installmentAmountPaid;
    @Column(name = "termin_platnosci")
    private LocalDate paymentDeadline;
    @Column(name = "data_zaplacenia")
    private LocalDate paymentDate;
    @Enumerated(EnumType.STRING)
    @Column(name = "czy_splacony")
    private PaymentStatus paymentStatus;
}
