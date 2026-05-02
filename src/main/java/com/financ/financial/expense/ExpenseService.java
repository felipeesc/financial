package com.financ.financial.expense;

import com.financ.financial.category.Category;
import com.financ.financial.category.CategoryRepository;
import com.financ.financial.paymentmethod.PaymentMethod;
import com.financ.financial.paymentmethod.PaymentMethodRepository;
import com.financ.financial.user.UserRepository;
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
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PaymentMethodRepository paymentMethodRepository;

    @Transactional(readOnly = true)
    public List<ExpenseResponse> findByMonth(UUID userId, YearMonth month) {
        return expenseRepository
                .findByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(
                        userId, month.atDay(1), month.atEndOfMonth())
                .stream()
                .map(ExpenseResponse::from)
                .toList();
    }

    @Transactional
    public Expense create(UUID userId, ExpenseRequest request) {
        Expense expense = Expense.builder()
                .user(userRepository.getReferenceById(userId))
                .category(resolveCategory(request.categoryId(), userId))
                .paymentMethod(resolvePaymentMethod(request.paymentMethodId(), userId))
                .description(request.description())
                .amount(request.amount())
                .expenseDate(request.expenseDate())
                .build();
        return expenseRepository.save(expense);
    }

    @Transactional
    public Expense update(UUID expenseId, UUID userId, ExpenseRequest request) {
        Expense expense = findOwned(expenseId, userId);
        expense.setCategory(resolveCategory(request.categoryId(), userId));
        expense.setPaymentMethod(resolvePaymentMethod(request.paymentMethodId(), userId));
        expense.setDescription(request.description());
        expense.setAmount(request.amount());
        expense.setExpenseDate(request.expenseDate());
        return expenseRepository.save(expense);
    }

    @Transactional
    public void delete(UUID expenseId, UUID userId) {
        expenseRepository.delete(findOwned(expenseId, userId));
    }

    @Transactional(readOnly = true)
    public List<MonthlySummaryResponse> getMonthlySummary(UUID userId, YearMonth month) {
        return expenseRepository
                .sumAmountByCategoryAndPeriod(userId, month.atDay(1), month.atEndOfMonth())
                .stream()
                .map(MonthlySummaryResponse::from)
                .toList();
    }

    private Expense findOwned(UUID expenseId, UUID userId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!expense.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return expense;
    }

    private Category resolveCategory(UUID categoryId, UUID userId) {
        if (categoryId == null) return null;
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Category not found or does not belong to user"));
    }

    private PaymentMethod resolvePaymentMethod(UUID paymentMethodId, UUID userId) {
        if (paymentMethodId == null) return null;
        return paymentMethodRepository.findByIdAndUserId(paymentMethodId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Payment method not found or does not belong to user"));
    }
}
