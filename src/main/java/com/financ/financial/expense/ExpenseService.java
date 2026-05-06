package com.financ.financial.expense;

import com.financ.financial.category.CategoryRepository;
import com.financ.financial.user.AuthenticatedUserResolver;
import com.financ.financial.workspace.TenantContext;
import com.financ.financial.workspace.WorkspaceRepository;
import com.financ.financial.workspace.WorkspaceSecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceSecurityService workspaceSecurity;
    private final AuthenticatedUserResolver userResolver;

    @Transactional(readOnly = true)
    public List<ExpenseResponse> findByMonth(YearMonth month) {
        UUID workspaceId = TenantContext.getWorkspaceId();
        return expenseRepository
                .findByWorkspaceIdAndExpenseDateBetweenOrderByExpenseDateDesc(
                        workspaceId, month.atDay(1), month.atEndOfMonth())
                .stream()
                .map(ExpenseResponse::from)
                .toList();
    }

    @Transactional
    public Expense create(ExpenseRequest request) {
        workspaceSecurity.requireWriteAccess();
        UUID workspaceId = TenantContext.getWorkspaceId();
        Expense expense = Expense.builder()
                .user(userResolver.resolve())
                .workspace(workspaceRepository.getReferenceById(workspaceId))
                .category(resolveCategory(request.categoryId(), workspaceId))
                .paymentMethod(request.paymentMethod())
                .description(request.description())
                .amount(request.amount())
                .expenseDate(request.expenseDate())
                .build();
        return expenseRepository.save(expense);
    }

    @Transactional
    public Expense update(UUID expenseId, ExpenseRequest request) {
        workspaceSecurity.requireWriteAccess();
        UUID workspaceId = TenantContext.getWorkspaceId();
        Expense expense = findOwned(expenseId, workspaceId);
        expense.setCategory(resolveCategory(request.categoryId(), workspaceId));
        expense.setPaymentMethod(request.paymentMethod());
        expense.setDescription(request.description());
        expense.setAmount(request.amount());
        expense.setExpenseDate(request.expenseDate());
        return expenseRepository.save(expense);
    }

    @Transactional
    public void delete(UUID expenseId) {
        workspaceSecurity.requireWriteAccess();
        expenseRepository.delete(findOwned(expenseId, TenantContext.getWorkspaceId()));
    }

    @Transactional(readOnly = true)
    public List<MonthlySummaryResponse> getMonthlySummary(YearMonth month) {
        UUID workspaceId = TenantContext.getWorkspaceId();
        return expenseRepository
                .sumAmountByCategoryAndPeriod(workspaceId, month.atDay(1), month.atEndOfMonth())
                .stream()
                .map(MonthlySummaryResponse::from)
                .toList();
    }

    private Expense findOwned(UUID expenseId, UUID workspaceId) {
        return expenseRepository.findByIdAndWorkspaceId(expenseId, workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private com.financ.financial.category.Category resolveCategory(UUID categoryId, UUID workspaceId) {
        if (categoryId == null) return null;
        return categoryRepository.findByIdAndWorkspaceId(categoryId, workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Category not found or does not belong to workspace"));
    }
}
