package net.focik.homeoffice.library.domain.port.primary;

import net.focik.homeoffice.library.domain.model.Category;

import java.util.List;

public interface FindCategoryUseCase {
    Category getById(Integer idCategory);

    List<Category> getAll();
}
