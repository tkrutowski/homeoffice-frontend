package net.focik.homeoffice.addresses.domain;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class AddressFacade {

    private final AddressService addressService;

    public Address addAddress(Address address) {
        return addressService.addAddress(address);
    }

    public Address updateAddress(Address address) {
        return addressService.updateAddress(address);
    }

    public Address getAddress(Integer id) {
        return addressService.getAddress(id);
    }

    public void deleteAddress(Integer id){
        addressService.deleteAddress(id);
    }

}
