package com.financ.financial.category;

import com.financ.financial.user.User;
import com.financ.financial.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<Category> findAll(UUID userId) {
        return categoryRepository.findByUserId(userId);
    }

    public Category create(UUID userId, String name, String color) {
        User user = userRepository.getReferenceById(userId);
        Category category = Category.builder()
                .user(user)
                .name(name)
                .color(color != null ? color : "#6366f1")
                .build();
        return categoryRepository.save(category);
    }

    public Category update(UUID categoryId, UUID userId, String name, String color) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        category.setName(name);
        category.setColor(color != null ? color : "#6366f1");
        return categoryRepository.save(category);
    }

    public void delete(UUID categoryId, UUID userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!category.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        categoryRepository.delete(category);
    }
}
