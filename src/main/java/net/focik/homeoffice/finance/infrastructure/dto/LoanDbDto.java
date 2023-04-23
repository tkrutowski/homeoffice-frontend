package net.focik.homeoffice.finance.infrastructure.dto;

import lombok.*;
import net.focik.homeoffice.finance.domain.loan.LoanStatus;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "kredyt")
@Getter
@ToString
@Builder
public class LoanDbDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_kredytu")
    private Integer id;
    @Column(name = "id_banku")
    private Integer idBank;
    @Column(name = "id_uzytkownika")
    private Integer idUser;
    @Column(name = "kwota_kredytu")
    private BigDecimal amount;
    @Column(name = "data_kredytu")
    private LocalDate date;
    @Column(name = "nr_kredytu")
    private String loanNumber;
    @Column(name = "nr_konta")
    private String accountNumber;
    @Column(name = "data_pier_wplaty")
    private LocalDate firstPaymentDate;
    @Column(name = "ilosc_rat")
    private Integer numberOfInstallments;
    @Column(name = "kwota_raty")
    private BigDecimal installmentAmount;
    @Column(name = "nazwa")
    private String name;
    @Column(name = "inne")
    private String otherInfo;
    @Enumerated(EnumType.STRING)
    @Column(name = "czy_splacony")
    private LoanStatus loanStatus;
    @Column(name = "koszt_uzyskania_kredytu")
    private BigDecimal loanCost;
}
