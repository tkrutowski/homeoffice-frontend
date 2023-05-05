package net.focik.homeoffice.finance.infrastructure.dto;

import lombok.*;
import net.focik.homeoffice.finance.domain.fee.FeeFrequencyEnum;
import net.focik.homeoffice.utils.share.PaymentStatus;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "oplata")
@Getter
@ToString
@Builder
public class FeeDbDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_oplaty")
    private Integer id;
    @Column(name = "id_firmy")
    private Integer idFirm;
    @Column(name = "id_uzytkownika")
    private Integer idUser;
    @Column(name = "nazwa")
    private String name;
    @Column(name = "nr_umowy")
    private String feeNumber;
    @Column(name = "data_podpisania")
    private LocalDate date;
    @Enumerated(EnumType.STRING)
    @Column(name = "id_czestotliwosc_oplat")
    private FeeFrequencyEnum feeFrequencyEnum;
    @Column(name = "ilosc_pobran")
    private Integer numberOfPayments;
    @Column(name = "kwota_oplaty")
    private BigDecimal amount;
    @Column(name = "data_pier_wplaty")
    private LocalDate firstPaymentDate;
    @Column(name = "nr_konta")
    private String accountNumber;
    @Column(name = "inne")
    private String otherInfo;
    @Enumerated(EnumType.STRING)
    @Column(name = "czy_zakonczona")
    private PaymentStatus paymentStatus;
}
