package com.financ.financial.category;

import com.financ.financial.user.AuthenticatedUserResolver;
import com.financ.financial.workspace.TenantContext;
import com.financ.financial.workspace.WorkspaceRepository;
import com.financ.financial.workspace.WorkspaceSecurityService;
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
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceSecurityService workspaceSecurity;
    private final AuthenticatedUserResolver userResolver;

    public List<Category> findAll() {
        return categoryRepository.findByWorkspaceId(TenantContext.getWorkspaceId());
    }

    public Category create(String name, String color) {
        workspaceSecurity.requireWriteAccess();
        Category category = Category.builder()
                .user(userResolver.resolve())
                .workspace(workspaceRepository.getReferenceById(TenantContext.getWorkspaceId()))
                .name(name)
                .color(color != null ? color : "#6366f1")
                .build();
        return categoryRepository.save(category);
    }

    public Category update(UUID categoryId, String name, String color) {
        workspaceSecurity.requireWriteAccess();
        Category category = findOwned(categoryId);
        category.setName(name);
        category.setColor(color != null ? color : "#6366f1");
        return categoryRepository.save(category);
    }

    public void delete(UUID categoryId) {
        workspaceSecurity.requireWriteAccess();
        categoryRepository.delete(findOwned(categoryId));
    }

    private Category findOwned(UUID categoryId) {
        return categoryRepository.findByIdAndWorkspaceId(categoryId, TenantContext.getWorkspaceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
