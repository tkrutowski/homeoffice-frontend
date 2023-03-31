package net.focik.homeoffice.library.domain.port.secondary;

import net.focik.homeoffice.library.domain.model.Category;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public interface CategoryRepository {
    Integer add(Category category);

    Optional<Category> edit(Category category);

    void delete(Integer id);

    List<Category> findAll();

    Optional<Category> findById(Integer id);

    Optional<Category> findByName(String name);
}
