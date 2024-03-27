package net.focik.homeoffice.finance.api.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Builder
@Getter
@ToString
public class PurchaseDto {
    private int id;
    private int idCard;
    private int idFirm;
    private int idUser;
    private String name;
    private String purchaseDate;
    private String amount;
    private String paymentDeadline;
    private String paymentDate;
    private String otherInfo;
    private PaymentStatusDto paymentStatus;
    private boolean isInstallment;
}