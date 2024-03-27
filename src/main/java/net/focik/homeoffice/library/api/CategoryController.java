package net.focik.homeoffice.library.api;

import lombok.AllArgsConstructor;
import net.focik.homeoffice.library.api.dto.CategoryDto;
import net.focik.homeoffice.library.domain.model.Category;
import net.focik.homeoffice.library.domain.port.primary.FindCategoryUseCase;
import net.focik.homeoffice.library.domain.port.primary.SaveCategoryUseCase;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/library/category")
public class CategoryController {

    private final FindCategoryUseCase findCategoryUseCase;
    private final SaveCategoryUseCase saveCategoryUseCase;
    private final ModelMapper mapper;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('LIBRARY_READ_ALL','LIBRARY_READ')")
    ResponseEntity<List<CategoryDto>> getAllCategories() {
        List<Category> categories = findCategoryUseCase.getAll();
        return new ResponseEntity<>(categories.stream()
                .map(cat -> mapper.map(cat, CategoryDto.class))
                .collect(Collectors.toList()), HttpStatus.OK);
    }

//    CategoryService categoryService;
//
    @PostMapping
    @PreAuthorize("hasAnyAuthority('LIBRARY_READ_ALL','LIBRARY_READ')")
    
    public  ResponseEntity<CategoryDto> addCategory(@RequestBody Category category) {
        Category added = saveCategoryUseCase.add(category);
        return new ResponseEntity<>(mapper.map(added, CategoryDto.class),HttpStatus.CREATED);
    }
//
//    @PutMapping("/{id}")
//    public Category editCategory(@RequestBody Category category, @PathVariable Long id) {
//        return categoryService.editCategory(category, id);
//    }
//
//    @DeleteMapping("/{id}")
//    public void deleteCategory(@PathVariable Long id) {
//        categoryService.deleteCategory(id);
//    }
//
//    @GetMapping("/{id}")
//    public Category findCategory(@PathVariable Long id) {
//        return categoryService.findCategory(id);
//    }
//
//    @GetMapping
//    public List<Category> findAllCategories() {
//        return categoryService.findAllCategories();
//    }

}
