package net.focik.homeoffice.finance.infrastructure.dto;

import lombok.*;
import net.focik.homeoffice.utils.share.ActiveStatus;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "karta")
@Getter
@ToString
@Builder
public class CardDbDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_karty")
    private Integer id;
    @Column(name = "id_banku")
    private Integer idBank;
    @Column(name = "id_uzytkownika")
    private Integer idUser;
    @Column(name = "nazwa_karty")
    private String name;
    @Column(name = "data_aktywacji")
    private LocalDate activationDate;
    @Column(name = "limit")
    private BigDecimal amount;
    @Column(name = "dzien_splaty")
    private Integer repaymentDay;
    @Column(name = "data_wygasniecia")
    private LocalDate expirationDate;
    @Column(name = "inne")
    private String otherInfo;
    @Column(name = "czy_aktywna")
    private ActiveStatus activeStatus;
    @Column(name = "nr_karty")
    private String cardNumber;
    @Column(name = "dzien_zamkniecia")
    private Integer closingDay;
}