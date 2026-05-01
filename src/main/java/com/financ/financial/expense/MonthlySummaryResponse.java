package com.financ.financial.expense;

import java.math.BigDecimal;

public record MonthlySummaryResponse(
        String categoryName,
        String categoryColor,
        BigDecimal total
) {
    static MonthlySummaryResponse from(CategorySummary s) {
        return new MonthlySummaryResponse(s.categoryName(), s.color(), s.total());
    }
}
