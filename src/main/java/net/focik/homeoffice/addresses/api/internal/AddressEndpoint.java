package net.focik.homeoffice.addresses.api.internal;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.focik.homeoffice.addresses.domain.Address;
import net.focik.homeoffice.addresses.domain.AddressFacade;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@RequiredArgsConstructor
@Log4j2
@Component
public class AddressEndpoint {

    private final AddressFacade addressFacade;
//    private  AddressFacade facade;
//    @PostConstruct
//    public void init() {
//        this.addressFacade =  facade;
//    }

    public  Address getAddress(Integer id) {
        log.info("ADDRESS-INTERNAL-SERVICE: Try find address for  id = " + id);
        Address address = addressFacade.getAddress(id);
        log.info(address != null ? "ADDRESS-INTERNAL-SERVICE: Found address for id = " + id : "ADDRESS-INTERNAL-SERVICE: Not found address for id = " + id);
        return address;
    }

    public  Address addAddress(Address address) {
        log.info("ADDRESS-INTERNAL-SERVICE: Try add address: " + address);
        Address saved = addressFacade.addAddress(address);
        log.info(saved != null ? "ADDRESS-INTERNAL-SERVICE: Added address id = " + saved.getId() : "ADDRESS-INTERNAL-SERVICE: Not added address: " + address);
        return saved;
    }

    public  Address updateAddress(Address address) {
        log.info("ADDRESS-INTERNAL-SERVICE: Try update address: " + address);
        Address saved = addressFacade.updateAddress(address);
        log.info(saved != null ? "ADDRESS-INTERNAL-SERVICE: updated address id = " + saved.getId() : "ADDRESS-INTERNAL-SERVICE: Not added address: " + address);
        return saved;
    }
}
