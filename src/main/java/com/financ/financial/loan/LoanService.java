package com.financ.financial.loan;

import com.financ.financial.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final LoanPaymentRepository loanPaymentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Loan> findAll(UUID userId) {
        return loanRepository.findByUserIdOrderByLoanDateDesc(userId);
    }

    @Transactional(readOnly = true)
    public Loan findOwned(UUID loanId, UUID userId) {
        return loanRepository.findByIdAndUserId(loanId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Loan create(UUID userId, String borrowerName, String borrowerCpf,
                       BigDecimal principalAmount, BigDecimal interestRate,
                       BigDecimal userRate, BigDecimal referrerRate,
                       String referrerName, LocalDate loanDate, LocalDate dueDate, String notes) {

        if (userRate.add(referrerRate).compareTo(interestRate) != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "userRate + referrerRate deve ser igual a interestRate");
        }

        Loan loan = Loan.builder()
                .user(userRepository.getReferenceById(userId))
                .borrowerName(borrowerName)
                .borrowerCpf(borrowerCpf)
                .principalAmount(principalAmount)
                .interestRate(interestRate)
                .userRate(userRate)
                .referrerRate(referrerRate)
                .referrerName(referrerName)
                .loanDate(loanDate)
                .dueDate(dueDate)
                .status("ACTIVE")
                .notes(notes)
                .build();

        return loanRepository.save(loan);
    }

    @Transactional
    public Loan markAsPaid(UUID loanId, UUID userId) {
        Loan loan = findOwned(loanId, userId);
        loan.setStatus("PAID");
        return loanRepository.save(loan);
    }

    @Transactional
    public void delete(UUID loanId, UUID userId) {
        loanRepository.delete(findOwned(loanId, userId));
    }

    @Transactional(readOnly = true)
    public List<LoanPayment> findPayments(UUID loanId, UUID userId) {
        findOwned(loanId, userId);
        return loanPaymentRepository.findByLoanIdOrderByPaymentDateDesc(loanId);
    }

    @Transactional
    public LoanPayment registerPayment(UUID loanId, UUID userId,
                                       LocalDate paymentDate, BigDecimal totalAmount, String notes) {
        Loan loan = findOwned(loanId, userId);

        BigDecimal userAmount;
        BigDecimal referrerAmount;

        if (loan.getInterestRate().compareTo(BigDecimal.ZERO) == 0) {
            userAmount = totalAmount;
            referrerAmount = BigDecimal.ZERO;
        } else {
            userAmount = totalAmount
                    .multiply(loan.getUserRate())
                    .divide(loan.getInterestRate(), 2, RoundingMode.HALF_UP);
            referrerAmount = totalAmount.subtract(userAmount);
        }

        LoanPayment payment = LoanPayment.builder()
                .loan(loan)
                .paymentDate(paymentDate)
                .totalAmount(totalAmount)
                .userAmount(userAmount)
                .referrerAmount(referrerAmount)
                .notes(notes)
                .build();

        return loanPaymentRepository.save(payment);
    }

    @Transactional
    public void deletePayment(UUID loanId, UUID paymentId, UUID userId) {
        findOwned(loanId, userId);
        LoanPayment payment = loanPaymentRepository.findByIdAndLoanId(paymentId, loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        loanPaymentRepository.delete(payment);
    }
}
