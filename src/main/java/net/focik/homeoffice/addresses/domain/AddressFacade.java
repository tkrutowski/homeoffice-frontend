package net.focik.homeoffice.addresses.domain;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.addresses.domain.exceptions.AddressNotFoundException;
import net.focik.homeoffice.addresses.domain.exceptions.AddressNotValidException;
import net.focik.homeoffice.addresses.domain.port.AddressRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

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
}
