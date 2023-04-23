package net.focik.homeoffice.finance.domain.bank;

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
public class Bank {

    private int id;
    private String name;
    private Address address;
    private String phone;
    private String phone2;
    private String fax;
    private String mail;
    private String www;
    private String otherInfo;

    public void  updateAddress(String city, String street, String zip) {
        if (StringUtils.isNotEmpty(city)){
            this.address.setCity(city);
        }
        if (StringUtils.isNotEmpty(street)){
            this.address.setStreet(street);
        }
        if (StringUtils.isNotEmpty(zip)){
            this.address.setZip(zip);
        }
    }

    public void setAddress(String city, String street, String zip) {
        this.address = new Address(0, city, street, zip);
    }
}