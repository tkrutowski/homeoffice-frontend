package net.focik.homeoffice.finance.api.mapper;

import net.focik.homeoffice.finance.api.dto.BankDto;
import net.focik.homeoffice.finance.domain.bank.Bank;
import org.springframework.stereotype.Component;

@Component
public class ApiBankMapper {
    public Bank toDomain(BankDto dto) {
        Bank build = Bank.builder()
                .id(dto.getId())
                .name(dto.getName())
                .phone(dto.getPhone())
                .phone2(dto.getPhone2())
                .mail(dto.getMail())
                .fax(dto.getFax())
                .otherInfo(dto.getOtherInfo())
                .build();
        build.setAddress(dto.getCity(), dto.getStreet(), dto.getZip());
        return build;
    }

    public BankDto toDto(Bank c) {
        return BankDto.builder()
                .id(c.getId())
                .name(c.getName())
                .phone(convertIfNull(c.getPhone()))
                .phone2(convertIfNull(c.getPhone2()))
                .otherInfo(convertIfNull(c.getOtherInfo()))
                .mail(convertIfNull(c.getMail()))
                .fax(convertIfNull(c.getFax()))
                .www(convertIfNull(c.getWww()))
                .city(convertIfNull(c.getAddress().getCity()))
                .street(convertIfNull(c.getAddress().getStreet()))
                .zip(convertIfNull(c.getAddress().getZip()))
                .build();
    }

    private String convertIfNull(String valueToCheck) {
        return valueToCheck == null ? "" : valueToCheck;
    }
}
