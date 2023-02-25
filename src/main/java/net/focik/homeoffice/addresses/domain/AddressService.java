package net.focik.homeoffice.addresses.domain;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.addresses.domain.exceptions.AddressAlreadyExistsException;
import net.focik.homeoffice.addresses.domain.exceptions.AddressNotFoundException;
import net.focik.homeoffice.addresses.domain.exceptions.AddressNotValidException;
import net.focik.homeoffice.addresses.domain.port.AddressRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@AllArgsConstructor
class AddressService {

    //@Qualifier("inMemoryClientRepositoryAdapter")
    private final AddressRepository addressRepository;

    public Address addAddress(Address address) {
        if (address.getId()!=0) {
            Optional<Address> byId = addressRepository.findById(address.getId());

            if (byId.isPresent())
                throw new AddressAlreadyExistsException(address.getId());
        }
        return addressRepository.save(address);
    }

    public Address updateAddress(Address address) {
//        Optional<Address> byId = addressRepository.findById(address.getId());
//
        if (address.getId() == null || address.getId() <=0)
            throw new AddressNotValidException("Id can't be 0 or null: " + address.getId());
//        int i = 0;
        return addressRepository.save(address);
    }

    public Address getAddress(Integer id) {
        Optional<Address> byId = addressRepository.findById(id);

        if (byId.isEmpty())
            throw new AddressNotFoundException(id);

        return byId.get();
    }
}
