package net.focik.homeoffice.library.domain;

import lombok.RequiredArgsConstructor;
import net.focik.homeoffice.library.domain.exception.CategoryNotFoundException;
import net.focik.homeoffice.library.domain.model.Category;
import net.focik.homeoffice.library.domain.port.secondary.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
class CategoryService {

    private final CategoryRepository categoryRepository;

    public Integer addCategory(Category category) {
        Optional<Category> optionalCategory = categoryRepository.findByName(category.getName());
        if (optionalCategory.isPresent()) {
            throw new CategoryNotFoundException(category);
        }
        return categoryRepository.add(category);
    }

    public Category editCategory(Category categoryToEdit, Integer id) {
        Optional<Category> categoryById = categoryRepository.findById(id);
        if (categoryById.isEmpty()) {
            throw new CategoryNotFoundException(id);
        }
        categoryById.get().setName(categoryToEdit.getName());

        return categoryRepository.edit(categoryById.get()).get();
    }

    public void deleteCategory(Integer id) {
        categoryRepository.delete(id);
    }

    public Category findCategory(Integer id) {
        Optional<Category> categoryById = categoryRepository.findById(id);
        if (categoryById.isEmpty()) {
            throw new CategoryNotFoundException(id);
        }
        return categoryById.get();
    }

    public List<Category> findAllCategories() {
        return categoryRepository.findAll();
    }

}
