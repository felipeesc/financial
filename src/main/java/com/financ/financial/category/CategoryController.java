package com.financ.financial.category;

import com.financ.financial.user.AuthenticatedUserResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public List<Category> findAll() {
        return categoryService.findAll(userResolver.resolveId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Category create(@RequestBody CategoryRequest request) {
        return categoryService.create(userResolver.resolveId(), request.name(), request.color());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        categoryService.delete(id, userResolver.resolveId());
    }

    record CategoryRequest(String name, String color) {}
}
