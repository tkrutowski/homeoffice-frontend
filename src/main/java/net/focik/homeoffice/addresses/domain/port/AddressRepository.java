package net.focik.homeoffice.addresses.domain.port;

import net.focik.homeoffice.addresses.domain.Address;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public interface AddressRepository {

    Address save(Address address);

    Optional<Address> findById(Integer id);
}
