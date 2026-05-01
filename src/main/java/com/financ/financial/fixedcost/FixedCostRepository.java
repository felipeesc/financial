package com.financ.financial.fixedcost;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FixedCostRepository extends JpaRepository<FixedCost, UUID> {

    List<FixedCost> findByUserIdAndActiveTrue(UUID userId);
}
