package com.financ.financial.workspace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, UUID> {
    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
    List<WorkspaceMember> findByUserId(UUID userId);
    boolean existsByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
}
