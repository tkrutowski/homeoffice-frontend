package net.focik.homeoffice.goahead.api.dto;

import lombok.*;
import net.focik.homeoffice.addresses.domain.Address;
import net.focik.homeoffice.goahead.domain.customer.CustomerStatus;
import net.focik.homeoffice.goahead.domain.customer.CustomerType;
import org.apache.commons.lang3.StringUtils;

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