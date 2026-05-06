package com.financ.financial.expense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findByWorkspaceIdAndExpenseDateBetweenOrderByExpenseDateDesc(
            UUID workspaceId, LocalDate start, LocalDate end);

    Optional<Expense> findByIdAndWorkspaceId(UUID id, UUID workspaceId);

    @Query("""
            SELECT new com.financ.financial.expense.CategorySummary(
                c.name,
                c.color,
                SUM(e.amount)
            )
            FROM Expense e
            JOIN e.category c
            WHERE e.workspace.id = :workspaceId
              AND e.expenseDate BETWEEN :start AND :end
            GROUP BY c.id, c.name, c.color
            ORDER BY SUM(e.amount) DESC
            """)
    List<CategorySummary> sumAmountByCategoryAndPeriod(
            @Param("workspaceId") UUID workspaceId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);
}
