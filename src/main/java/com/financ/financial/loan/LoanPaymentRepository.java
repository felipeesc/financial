package com.financ.financial.loan;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LoanPaymentRepository extends JpaRepository<LoanPayment, UUID> {

    List<LoanPayment> findByLoanIdOrderByPaymentDateDesc(UUID loanId);

    Optional<LoanPayment> findByIdAndLoanId(UUID id, UUID loanId);
}
