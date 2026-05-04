package com.financ.financial.loan;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        LocalDate paymentDate,
        BigDecimal totalAmount,
        BigDecimal userAmount,
        BigDecimal referrerAmount,
        String notes,
        LocalDateTime createdAt
) {
    static PaymentResponse from(LoanPayment p) {
        return new PaymentResponse(
                p.getId(),
                p.getPaymentDate(),
                p.getTotalAmount(),
                p.getUserAmount(),
                p.getReferrerAmount(),
                p.getNotes(),
                p.getCreatedAt()
        );
    }
}
