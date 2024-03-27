package net.focik.homeoffice.library.domain.port.primary;

import net.focik.homeoffice.library.domain.model.Category;

public interface SaveCategoryUseCase {
    Category add(Category category);
}
