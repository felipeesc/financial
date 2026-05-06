package com.financ.financial.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findByWorkspaceId(UUID workspaceId);

    Optional<Category> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
}
