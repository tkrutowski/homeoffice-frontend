package net.focik.homeoffice.library.api;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

//    CategoryService categoryService;
//
//    @PostMapping
//    public Long addCategory(@RequestBody Category category) {
//        return categoryService.addCategory(category);
//    }
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
