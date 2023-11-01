package net.focik.homeoffice.finance.domain.card;

import lombok.*;
import net.focik.homeoffice.utils.share.ActiveStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class Card {

    private int id;
    private int idBank;
    private int idUser;
    private String cardName;
    private LocalDate activationDate;
    private BigDecimal limit;
    private int repaymentDay;
    private LocalDate expirationDate;
    private String otherInfo;
    private ActiveStatus activeStatus;
    private String cardNumber;
    private int closingDay;

    public void changeActiveStatus(ActiveStatus activeStatus) {
        this.activeStatus = activeStatus;
    }
}