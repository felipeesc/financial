package com.financ.financial.fixedcost;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FixedCostRepository extends JpaRepository<FixedCost, UUID> {

    List<FixedCost> findByWorkspaceIdAndActiveTrue(UUID workspaceId);

    List<FixedCost> findByWorkspaceIdOrderByDueDayAscNameAsc(UUID workspaceId);

    Optional<FixedCost> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
}
