package net.focik.homeoffice.finance.api.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Builder
@Getter
@ToString
public class CardDto {
    private int id;
    private int idBank;
    private int idUser;
    private String name;
    private String activationDate;
    private String limit;
    private int repaymentDay;
    private String expirationDate;
    private String otherInfo;
    private String activeStatus;
    private String cardNumber;
    private int closingDay;
}