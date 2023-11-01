package net.focik.homeoffice.finance.infrastructure.mapper;

import net.focik.homeoffice.addresses.domain.Address;
import net.focik.homeoffice.finance.domain.bank.Bank;
import net.focik.homeoffice.finance.infrastructure.dto.BankDbDto;
import org.springframework.stereotype.Component;

@Component
public class JpaBankMapper {

    public BankDbDto toDto(Bank bank) {
        return BankDbDto.builder()
                .id(bank.getId())
                .name(bank.getName())
                .phone(bank.getPhone())
                .phone2(bank.getPhone2())
                .mail(bank.getMail())
                .otherInfo(bank.getOtherInfo())
                .idAddress(bank.getAddress().getId())
                .build();
    }

    public Bank toDomain(BankDbDto dto) {
        return Bank.builder()
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