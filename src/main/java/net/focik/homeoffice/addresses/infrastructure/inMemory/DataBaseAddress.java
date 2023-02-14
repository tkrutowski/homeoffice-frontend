package net.focik.homeoffice.addresses.infrastructure.inMemory;

import net.focik.homeoffice.addresses.infrastructure.dto.AddressDbDto;

import java.util.HashMap;
import java.util.Map;


public class DataBaseAddress {
    private static HashMap<Integer, AddressDbDto> addressDbDtoHashMap;

    public static Map<Integer, AddressDbDto> getAddressHashMap() {
        if (addressDbDtoHashMap == null)
            addressDbDtoHashMap = new HashMap<>();
        return addressDbDtoHashMap;
    }


    private DataBaseAddress() {
    }
}
