package com.financ.financial.expense;

import java.math.BigDecimal;

public record CategorySummary(String categoryName, String color, BigDecimal total) {
}
