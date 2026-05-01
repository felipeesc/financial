package com.financ.financial.expense;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ExpenseRequest(

        UUID categoryId,

        UUID paymentMethodId,

        @NotNull
        String description,

        @NotNull
        @DecimalMin("0.01")
        BigDecimal amount,

        @NotNull
        LocalDate expenseDate
) {}
