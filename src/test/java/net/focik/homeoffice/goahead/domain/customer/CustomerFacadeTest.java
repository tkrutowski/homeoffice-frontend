package net.focik.homeoffice.goahead.domain.customer;

import net.focik.homeoffice.addresses.api.internal.AddressEndpoint;
import net.focik.homeoffice.addresses.domain.Address;
import net.focik.homeoffice.addresses.domain.AddressFacade;
import net.focik.homeoffice.addresses.domain.port.AddressRepository;
import net.focik.homeoffice.addresses.infrastructure.inMemory.InMemoryAddressRepositoryAdapter;
import net.focik.homeoffice.goahead.domain.customer.port.secondary.CustomerRepository;
import net.focik.homeoffice.goahead.domain.exception.CustomerAlreadyExistException;
import net.focik.homeoffice.goahead.domain.exception.CustomerNotFoundException;
import net.focik.homeoffice.goahead.infrastructure.inMemory.InMemoryCustomerRepositoryAdapter;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class CustomerFacadeTest {

    static CustomerRepository customerRepository = new InMemoryCustomerRepositoryAdapter();
    static AddressRepository addressRepository = new InMemoryAddressRepositoryAdapter();
    static CustomerService service = new CustomerService(customerRepository, null);
    static CustomerFacade facade = new CustomerFacade(service);

    static Integer idCustomerToUpdate;
//    Customer customer;
    @BeforeAll
    static void setUp() {
//        customer = createCustomer();
//        idCustomer = facade.addCustomer(customer);

        facade.addCustomer(createCustomer1());
        idCustomerToUpdate = facade.addCustomer(createCustomer2());
        facade.addCustomer(createCustomer3());
        facade.addCustomer(createCustomer4());

        facade.addCustomer(createCustomer5());

        facade.addCustomer(createCustomerNip());
    }

    @Test
    void should_add_customer() {
        //given
        Customer customer = createCustomer();
        Integer idCustomer = facade.addCustomer(createCustomer());

        //when
        Customer byId = facade.findById(idCustomer, true);

        //then
        assertEquals(byId.getId(), idCustomer);
        assertEquals(customer.getFirstName(), byId.getFirstName());
        assertEquals(customer.getName(), byId.getName());
        assertEquals(customer.getNip(), byId.getNip());
        assertEquals(customer.getOtherInfo(), byId.getOtherInfo());
        assertEquals(customer.getMail(), byId.getMail());
        assertEquals(customer.getPhone(), byId.getPhone());
        assertEquals(customer.getAddress().getStreet(), byId.getAddress().getStreet());
        assertEquals(customer.getAddress().getZip(), byId.getAddress().getZip());
        assertEquals(customer.getAddress().getCity(), byId.getAddress().getCity());
        assertEquals(customer.getCustomerType(), byId.getCustomerType());
    }

    @Test
    void should_update_customer_into_company() {
        //given
        Customer customer = facade.findById(idCustomerToUpdate, true);
//        Customer result = facade.findById(idCustomerToUpdate);

        //when
        customer.setFirstName("");
        customer.setName("TTPSC");
        customer.setCustomerType(CustomerType.COMPANY);
        customer.setNip("777-78-87-888");
        customer.updateAddress(null,"Dąbrowskiego", null);
        int id = facade.updateCustomer(customer).getId();
        Customer result = facade.findById(id, true);

        //then
        assertEquals(result.getId(), idCustomerToUpdate);
        assertEquals(customer.getFirstName(), result.getFirstName());
        assertEquals(customer.getName(), result.getName());
        assertEquals(customer.getNip(), result.getNip());
        assertEquals(customer.getOtherInfo(), result.getOtherInfo());
        assertEquals(customer.getMail(), result.getMail());
        assertEquals(customer.getPhone(), result.getPhone());
        assertEquals(customer.getAddress().getStreet(), result.getAddress().getStreet());
        assertEquals(customer.getAddress().getZip(), result.getAddress().getZip());
        assertEquals(customer.getAddress().getCity(), result.getAddress().getCity());
        assertEquals(customer.getCustomerType(), result.getCustomerType());
    }

    @Test
    void should_throw_customer_not_found() {
        //given
//        Customer customer = createCustomer2();
//        Integer id = facade.addCustomer(createCustomer2());
            int NO_EXIST_ID = 99;
        //when

        //then
        assertThrows(CustomerNotFoundException.class, () -> facade.findById(NO_EXIST_ID, true));
    }


    @Test
    void findByName() {
        //given
//        Customer customer = createCustomer5();
//        facade.addCustomer(createCustomer5());
        String name = "Krutowski";

        //when
        List<Customer> byName = facade.findByName(name);

        //then
        assertEquals(1, byName.size());
        assertEquals(name, byName.get(0).getName());
    }

    @Test
    void should_throw_CustomerAlreadyExist_when_same_nip_exist() {
        //given
//        Customer company = createCustomerNip();
//        facade.addCustomer(createCustomerNip());
        Customer company2 = createCustomerNip2();


        //then
        assertThrows(CustomerAlreadyExistException.class, () -> facade.addCustomer(company2));
    }

    @Test
    void findAllByActive() {
        //given
//        Customer customer3 = createCustomer3();
//        facade.addCustomer(customer3);
//        Customer customer4 = createCustomer4();
//        facade.addCustomer(customer4);

        //when
        List<Customer> allByActive = facade.findByAll(CustomerStatus.ACTIVE, null, null);

        //then
        assertEquals(3, allByActive.size());
    }
@Test
    void tete(){
    Map<String, Integer> map1 = new HashMap<>();
    map1.put("a", 1);
    map1.put("b", 1);
    map1.merge("b", 1, Integer::sum);
    map1.merge("c", 3, (i1, i2)->i1+i2);
    System.out.println(map1);
    System.out.println();
    }
    private Customer createCustomer() {
        return Customer.builder()
                .firstName("Tom")
                .name("Kru")
                .address(Address.builder()
                        .city("Poznan")
                        .street("Szyperska")
                        .zip("61-754")
                        .build())
                .mail("focik@poczta.pl")
                .phone("662262662")
                .otherInfo("brak")
                .customerStatus(CustomerStatus.INACTIVE)
                .customerType(CustomerType.CUSTOMER)
                .build();
    }

    private static Customer createCustomer1() {
        return Customer.builder()
                .firstName("Dziedek")
                .name("Wostocki")
                .address(Address.builder()
                        .city("Poznan")
                        .street("Inna")
                        .zip("61-754")
                        .build())
                .mail("focik@poczta.pl")
                .phone("662262662")
                .otherInfo("brak")
                .customerStatus(CustomerStatus.ACTIVE)
                .customerType(CustomerType.CUSTOMER)
                .build();
    }

    private static Customer createCustomer2() {
        return Customer.builder()
                .firstName("Tom")
                .name("Kru")
                .address(Address.builder()
                        .city("Poznan")
                        .street("Szyperska")
                        .zip("61-754")
                        .build())
                .mail("focik@poczta.pl")
                .phone("662262662")
                .otherInfo("brak")
                .customerStatus(CustomerStatus.INACTIVE)
                .customerType(CustomerType.CUSTOMER)
                .build();
    }

    private static Customer createCustomer3() {
        return Customer.builder()
                .firstName("Tom")
                .name("Kru")
                .mail("focik@poczta.pl")
                .phone("662262662")
                .otherInfo("brak3")
                .customerStatus(CustomerStatus.INACTIVE)
                .customerType(CustomerType.CUSTOMER)
                .address(Address.builder()
                        .city("Poznan")
                        .street("Szyperska")
                        .zip("61-754")
                        .build())
                .build();
    }

    private static Customer createCustomer4() {
        return Customer.builder()
                .firstName("Tom")
                .name("Kru")
                .address(Address.builder()
                        .city("Poznan")
                        .street("Szyperska")
                        .zip("61-754")
                        .build())
                .mail("focik@poczta.pl")
                .phone("662262662")
                .otherInfo("brak4")
                .customerStatus(CustomerStatus.INACTIVE)
                .customerType(CustomerType.CUSTOMER)
                .build();
    }

    private static Customer createCustomer5() {
        return Customer.builder()
                .firstName("Tom")
                .name("Krutowski")
                .address(Address.builder()
                        .city("Poznan")
                        .street("Szyperska")
                        .zip("61-754")
                        .build())
                .mail("focik@poczta.pl")
                .phone("662262662")
                .otherInfo("brak")
                .customerStatus(CustomerStatus.ACTIVE)
                .customerType(CustomerType.CUSTOMER)
                .build();
    }

    private static Customer createCustomerNip() {
        return Customer.builder()
                .name("Company1")
                .address(Address.builder()
                        .city("Poznan")
                        .street("Szyperska")
                        .zip("61-754")
                        .build())
                .nip("777-29-77-543")
                .mail("focik@poczta.pl")
                .phone("662262662")
                .otherInfo("brak")
                .customerStatus(CustomerStatus.ACTIVE)
                .customerType(CustomerType.COMPANY)
                .build();
    }

    private Customer createCustomerNip2() {
        return Customer.builder()
                .name("Company2")
                .address(Address.builder()
                        .city("Poznan")
                        .street("Szyperska")
                        .zip("61-754")
                        .build())
                .nip("777-29-77-543")
                .mail("focik@poczta.pl")
                .phone("662262662")
                .otherInfo("brak")
                .customerType(CustomerType.COMPANY)
                .customerStatus(CustomerStatus.ACTIVE)
                .build();
    }
}