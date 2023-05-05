package net.focik.homeoffice.finance.infrastructure.dto;

import lombok.*;
import net.focik.homeoffice.utils.share.PaymentStatus;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "rata_oplaty")
@Getter
@ToString
@Builder
public class FeeInstallmentDbDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_raty")
    private Integer id;
    @Column(name = "id_oplaty")
    private Integer idFee;
    @Column(name = "kwota_do_zaplaty")
    private BigDecimal installmentAmountToPay;
    @Column(name = "kwota_zaplacona")
    private BigDecimal installmentAmountPaid;
    @Column(name = "termin_platnosci")
    private LocalDate paymentDeadline;
    @Column(name = "data_zaplacenia")
    private LocalDate paymentDate;
    @Enumerated(EnumType.STRING)
    @Column(name = "czy_zaplacona")
    private PaymentStatus paymentStatus;
}
