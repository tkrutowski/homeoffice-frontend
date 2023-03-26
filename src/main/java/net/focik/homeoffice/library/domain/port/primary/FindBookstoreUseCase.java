package net.focik.homeoffice.library.domain.port.primary;

import net.focik.homeoffice.library.domain.model.Bookstore;

import java.util.List;

public interface FindBookstoreUseCase {

    List<Bookstore> findAllBookstores();
    Bookstore findBookstoreById(Integer id);

}
