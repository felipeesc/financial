package com.financ.financial.loan;

import com.financ.financial.user.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public List<LoanResponse> findAll() {
        return loanService.findAll(userResolver.resolveId()).stream()
                .map(loan -> LoanResponse.from(loan,
                        loanService.findPayments(loan.getId(), userResolver.resolveId())))
                .toList();
    }

    @GetMapping("/{id}")
    public LoanResponse findById(@PathVariable UUID id) {
        UUID userId = userResolver.resolveId();
        Loan loan = loanService.findOwned(id, userId);
        return LoanResponse.from(loan, loanService.findPayments(id, userId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LoanResponse create(@Valid @RequestBody CreateLoanRequest req) {
        UUID userId = userResolver.resolveId();
        Loan loan = loanService.create(userId,
                req.borrowerName(), req.borrowerCpf(),
                req.principalAmount(), req.interestRate(),
                req.userRate(), req.referrerRate(),
                req.referrerName(), req.loanDate(), req.dueDate(), req.notes());
        return LoanResponse.from(loan, List.of());
    }

    @PatchMapping("/{id}/pay")
    public LoanResponse markAsPaid(@PathVariable UUID id) {
        UUID userId = userResolver.resolveId();
        Loan loan = loanService.markAsPaid(id, userId);
        return LoanResponse.from(loan, loanService.findPayments(id, userId));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        loanService.delete(id, userResolver.resolveId());
    }

    @GetMapping("/{id}/payments")
    public List<PaymentResponse> findPayments(@PathVariable UUID id) {
        return loanService.findPayments(id, userResolver.resolveId()).stream()
                .map(PaymentResponse::from)
                .toList();
    }

    @PostMapping("/{id}/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse registerPayment(@PathVariable UUID id,
                                           @Valid @RequestBody RegisterPaymentRequest req) {
        return PaymentResponse.from(loanService.registerPayment(
                id, userResolver.resolveId(),
                req.paymentDate(), req.totalAmount(), req.notes()));
    }

    @DeleteMapping("/{id}/payments/{paymentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePayment(@PathVariable UUID id, @PathVariable UUID paymentId) {
        loanService.deletePayment(id, paymentId, userResolver.resolveId());
    }

    // ── Request records ──────────────────────────────────────────────────────

    record CreateLoanRequest(
            @NotBlank String borrowerName,
            @NotBlank String borrowerCpf,
            @NotNull @DecimalMin("0.01") BigDecimal principalAmount,
            @NotNull @DecimalMin("0.01") BigDecimal interestRate,
            @NotNull @DecimalMin("0.01") BigDecimal userRate,
            @NotNull BigDecimal referrerRate,
            String referrerName,
            @NotNull LocalDate loanDate,
            LocalDate dueDate,
            String notes
    ) {}

    record RegisterPaymentRequest(
            @NotNull LocalDate paymentDate,
            @NotNull @DecimalMin("0.01") BigDecimal totalAmount,
            String notes
    ) {}
}
