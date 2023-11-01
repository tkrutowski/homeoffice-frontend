package net.focik.homeoffice.goahead.api.dto;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class CustomerDto {

    private int id;
    private String name;
    private String firstName;
    private String nip;
    private String phone;
    private String mail;
    private String customerType;
    private String customerStatus;
    private String otherInfo;
    private String city;
    private String street;
    private String zip;
    private String regon;


}