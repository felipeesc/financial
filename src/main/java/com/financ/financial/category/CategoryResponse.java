package com.financ.financial.category;

import java.util.UUID;

public record CategoryResponse(UUID id, String name, String color) {

    static CategoryResponse from(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getColor());
    }
}
