package com.financ.financial.expense;

import com.financ.financial.user.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public List<ExpenseResponse> findByMonth(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        return expenseService.findByMonth(userResolver.resolveId(), month);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse create(@Valid @RequestBody ExpenseRequest request) {
        return ExpenseResponse.from(expenseService.create(userResolver.resolveId(), request));
    }

    @PutMapping("/{id}")
    public ExpenseResponse update(@PathVariable UUID id,
                                  @Valid @RequestBody ExpenseRequest request) {
        return ExpenseResponse.from(expenseService.update(id, userResolver.resolveId(), request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        expenseService.delete(id, userResolver.resolveId());
    }

    @GetMapping("/summary")
    public List<MonthlySummaryResponse> getMonthlySummary(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        return expenseService.getMonthlySummary(userResolver.resolveId(), month);
    }
}
