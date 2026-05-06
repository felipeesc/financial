package com.financ.financial.loan;

import com.financ.financial.user.User;
import com.financ.financial.workspace.Workspace;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "loans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Column(name = "borrower_name", nullable = false, length = 100)
    private String borrowerName;

    @Column(name = "borrower_cpf", nullable = false, length = 14)
    private String borrowerCpf;

    @Column(name = "principal_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal principalAmount;

    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "user_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal userRate;

    @Column(name = "referrer_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal referrerRate;

    @Column(name = "referrer_name", length = 100)
    private String referrerName;

    @Column(name = "loan_date", nullable = false)
    private LocalDate loanDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false, length = 10)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "loan", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<LoanPayment> payments = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (status == null) status = "ACTIVE";
        createdAt = LocalDateTime.now();
    }
}
