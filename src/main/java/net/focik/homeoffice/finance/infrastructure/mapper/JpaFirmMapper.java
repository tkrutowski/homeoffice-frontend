package net.focik.homeoffice.finance.infrastructure.mapper;

import net.focik.homeoffice.addresses.domain.Address;
import net.focik.homeoffice.finance.domain.firm.Firm;
import net.focik.homeoffice.finance.infrastructure.dto.FirmDbDto;
import org.springframework.stereotype.Component;

@Component
public class JpaFirmMapper {

    public FirmDbDto toDto(Firm bank) {
        return FirmDbDto.builder()
                .id(bank.getId())
                .name(bank.getName())
                .phone(bank.getPhone())
                .phone2(bank.getPhone2())
                .mail(bank.getMail())
                .otherInfo(bank.getOtherInfo())
                .idAddress(bank.getAddress().getId())
                .build();
    }

    public Firm toDomain(FirmDbDto dto) {
        return Firm.builder()
                .id(dto.getId())
                .name(dto.getName())
                .phone(dto.getPhone())
                .phone2(dto.getPhone2())
                .mail(dto.getMail())
                .otherInfo(dto.getOtherInfo())
                .address(Address.builder().id(dto.getIdAddress()).build())
                .build();
    }
}