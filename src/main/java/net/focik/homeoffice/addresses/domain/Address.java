package net.focik.homeoffice.addresses.domain;

import lombok.*;


@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@EqualsAndHashCode
public class Address {
    private Integer id;
    private String city;
    private String street;
    private String zip;


    @Override
    public String toString() {
        return "ul. " + street + ", " + zip + " " + city;
    }

    public String toJsonString() {
        return "{" +
                "id=" + id +
                ", city='" + city + '\'' +
                ", street='" + street + '\'' +
                ", zip='" + zip + '\'' +
                '}';
    }
}
