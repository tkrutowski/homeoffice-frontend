package net.focik.homeoffice.goahead.api.mapper;

import net.focik.homeoffice.goahead.api.dto.CustomerDto;
import net.focik.homeoffice.goahead.domain.customer.Customer;
import net.focik.homeoffice.goahead.domain.customer.CustomerStatus;
import net.focik.homeoffice.goahead.domain.customer.CustomerType;
import org.springframework.stereotype.Component;

@Component
public class ApiCustomerMapper {
    public Customer toDomain(CustomerDto dto) {
        Customer build = Customer.builder()
                .id(dto.getId())
                .firstName(dto.getFirstName())
                .name(dto.getName())
                .regon(dto.getRegon())
                .nip(dto.getNip())
                .phone(dto.getPhone())
                .mail(dto.getMail())
                .otherInfo(dto.getOtherInfo())
                .customerType(CustomerType.valueOf(dto.getCustomerType()))
                .customerStatus(CustomerStatus.valueOf(dto.getCustomerStatus()))
                .build();
        build.setAddress(dto.getCity(), dto.getStreet(), dto.getZip());
        return build;
    }

    public CustomerDto toDto(Customer c) {
        return CustomerDto.builder()
                .id(c.getId())
                .firstName(c.getFirstName())
                .name(c.getName())
                .nip(c.getNip() == null ? "":c.getNip())
                .phone(c.getPhone())
                .otherInfo(c.getOtherInfo())
                .mail(c.getMail())
                .customerStatus(c.getCustomerStatus().toString())
                .customerType(c.getCustomerType().toString())
                .city(c.getAddress().getCity())
                .street(c.getAddress().getStreet())
                .zip(c.getAddress().getZip())
                .regon(c.getRegon() == null ? "":c.getRegon())
                .build();
    }
}
