package net.focik.homeoffice.library.domain.exception;

import net.focik.homeoffice.library.domain.model.Category;
import net.focik.homeoffice.utils.exceptions.ObjectNotFoundException;

public class CategoryNotFoundException extends ObjectNotFoundException {
    public CategoryNotFoundException(Integer id) {
        super("Category with id = " + id + " not found.");
    }
    public CategoryNotFoundException(Category category) {
        super("Category " + category + " not found.");
    }
}
