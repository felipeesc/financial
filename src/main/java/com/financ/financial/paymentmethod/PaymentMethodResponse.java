package com.financ.financial.paymentmethod;

import java.util.UUID;

public record PaymentMethodResponse(UUID id, String name) {

    static PaymentMethodResponse from(PaymentMethod p) {
        return new PaymentMethodResponse(p.getId(), p.getName());
    }
}
