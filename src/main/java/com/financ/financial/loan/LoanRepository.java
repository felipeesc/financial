package com.financ.financial.loan;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LoanRepository extends JpaRepository<Loan, UUID> {

    List<Loan> findByUserIdOrderByLoanDateDesc(UUID userId);

    Optional<Loan> findByIdAndUserId(UUID id, UUID userId);
}
