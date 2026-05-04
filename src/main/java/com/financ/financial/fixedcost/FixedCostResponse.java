package com.financ.financial.fixedcost;

import java.math.BigDecimal;
import java.util.UUID;

public record FixedCostResponse(UUID id, String name, BigDecimal amount, Integer dueDay, Boolean active) {

    static FixedCostResponse from(FixedCost f) {
        return new FixedCostResponse(f.getId(), f.getName(), f.getAmount(), f.getDueDay(), f.getActive());
    }
}
