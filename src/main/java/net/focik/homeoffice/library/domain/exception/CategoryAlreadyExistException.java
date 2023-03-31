package net.focik.homeoffice.library.domain.exception;

import net.focik.homeoffice.library.domain.model.Category;
import net.focik.homeoffice.utils.exceptions.ObjectAlreadyExistException;

public class CategoryAlreadyExistException extends ObjectAlreadyExistException {
    public CategoryAlreadyExistException(Category category) {
        super("Category already exists: " + category.toString());
    }
}
