package com.financ.financial.loan;

import com.financ.financial.user.AuthenticatedUserResolver;
import com.financ.financial.workspace.TenantContext;
import com.financ.financial.workspace.WorkspaceRepository;
import com.financ.financial.workspace.WorkspaceSecurityService;
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
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceSecurityService workspaceSecurity;
    private final AuthenticatedUserResolver userResolver;

    @Transactional(readOnly = true)
    public List<Loan> findAll() {
        return loanRepository.findByWorkspaceIdOrderByLoanDateDesc(TenantContext.getWorkspaceId());
    }

    @Transactional(readOnly = true)
    public Loan findOwned(UUID loanId) {
        return loanRepository.findByIdAndWorkspaceId(loanId, TenantContext.getWorkspaceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Loan create(String borrowerName, String borrowerCpf,
                       BigDecimal principalAmount, BigDecimal interestRate,
                       BigDecimal userRate, BigDecimal referrerRate,
                       String referrerName, LocalDate loanDate, LocalDate dueDate, String notes) {
        workspaceSecurity.requireWriteAccess();

        if (userRate.add(referrerRate).compareTo(interestRate) != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "userRate + referrerRate deve ser igual a interestRate");
        }

        Loan loan = Loan.builder()
                .user(userResolver.resolve())
                .workspace(workspaceRepository.getReferenceById(TenantContext.getWorkspaceId()))
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
    public Loan markAsPaid(UUID loanId) {
        workspaceSecurity.requireWriteAccess();
        Loan loan = findOwned(loanId);
        loan.setStatus("PAID");
        return loanRepository.save(loan);
    }

    @Transactional
    public void delete(UUID loanId) {
        workspaceSecurity.requireWriteAccess();
        loanRepository.delete(findOwned(loanId));
    }

    @Transactional(readOnly = true)
    public List<LoanPayment> findPayments(UUID loanId) {
        findOwned(loanId);
        return loanPaymentRepository.findByLoanIdOrderByPaymentDateDesc(loanId);
    }

    @Transactional
    public LoanPayment registerPayment(UUID loanId, LocalDate paymentDate,
                                       BigDecimal totalAmount, String notes) {
        workspaceSecurity.requireWriteAccess();
        Loan loan = findOwned(loanId);

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
    public void deletePayment(UUID loanId, UUID paymentId) {
        workspaceSecurity.requireWriteAccess();
        findOwned(loanId);
        LoanPayment payment = loanPaymentRepository.findByIdAndLoanId(paymentId, loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        loanPaymentRepository.delete(payment);
    }
}
