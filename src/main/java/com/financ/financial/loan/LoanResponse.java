package com.financ.financial.loan;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record LoanResponse(
        UUID id,
        String borrowerName,
        String borrowerCpf,
        BigDecimal principalAmount,
        BigDecimal interestRate,
        BigDecimal userRate,
        BigDecimal referrerRate,
        String referrerName,
        LocalDate loanDate,
        LocalDate dueDate,
        String status,
        String notes,
        LocalDateTime createdAt,

        // calculados
        BigDecimal monthlyTotal,
        BigDecimal monthlyUser,
        BigDecimal monthlyReferrer,

        BigDecimal totalReceived,
        BigDecimal totalUserReceived,
        BigDecimal totalReferrerReceived,
        int paymentCount
) {
    static LoanResponse from(Loan loan, List<LoanPayment> payments) {
        BigDecimal monthly = loan.getPrincipalAmount()
                .multiply(loan.getInterestRate())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal monthlyUser = loan.getPrincipalAmount()
                .multiply(loan.getUserRate())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal monthlyReferrer = loan.getPrincipalAmount()
                .multiply(loan.getReferrerRate())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal totalReceived = payments.stream()
                .map(LoanPayment::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalUser = payments.stream()
                .map(LoanPayment::getUserAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalReferrer = payments.stream()
                .map(LoanPayment::getReferrerAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new LoanResponse(
                loan.getId(),
                loan.getBorrowerName(),
                loan.getBorrowerCpf(),
                loan.getPrincipalAmount(),
                loan.getInterestRate(),
                loan.getUserRate(),
                loan.getReferrerRate(),
                loan.getReferrerName(),
                loan.getLoanDate(),
                loan.getDueDate(),
                loan.getStatus(),
                loan.getNotes(),
                loan.getCreatedAt(),
                monthly, monthlyUser, monthlyReferrer,
                totalReceived, totalUser, totalReferrer,
                payments.size()
        );
    }
}
