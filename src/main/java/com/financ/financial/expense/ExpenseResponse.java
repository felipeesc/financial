package com.financ.financial.expense;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ExpenseResponse(
        UUID id,
        String categoryName,
        String categoryColor,
        String paymentMethodName,
        String description,
        BigDecimal amount,
        LocalDate expenseDate
) {
    static ExpenseResponse from(Expense e) {
        return new ExpenseResponse(
                e.getId(),
                e.getCategory() != null ? e.getCategory().getName() : null,
                e.getCategory() != null ? e.getCategory().getColor() : null,
                e.getPaymentMethod(),
                e.getDescription(),
                e.getAmount(),
                e.getExpenseDate()
        );
    }
}
