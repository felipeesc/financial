package com.financ.financial.category;

import com.financ.financial.user.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    public List<CategoryResponse> findAll() {
        return categoryService.findAll(userResolver.resolveId()).stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(@Valid @RequestBody CategoryRequest request) {
        return CategoryResponse.from(
                categoryService.create(userResolver.resolveId(), request.name(), request.color()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        categoryService.delete(id, userResolver.resolveId());
    }

    record CategoryRequest(@NotBlank String name, String color) {}
}
