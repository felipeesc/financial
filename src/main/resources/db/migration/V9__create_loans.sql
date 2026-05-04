CREATE TABLE loans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    borrower_name   VARCHAR(100) NOT NULL,
    borrower_cpf    VARCHAR(14)  NOT NULL,
    principal_amount DECIMAL(12, 2) NOT NULL,
    interest_rate   DECIMAL(5, 2) NOT NULL,
    user_rate       DECIMAL(5, 2) NOT NULL,
    referrer_rate   DECIMAL(5, 2) NOT NULL DEFAULT 0,
    referrer_name   VARCHAR(100),
    loan_date       DATE NOT NULL,
    due_date        DATE,
    status          VARCHAR(10) NOT NULL DEFAULT 'ACTIVE',
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE loan_payments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id          UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    payment_date     DATE NOT NULL,
    total_amount     DECIMAL(12, 2) NOT NULL,
    user_amount      DECIMAL(12, 2) NOT NULL,
    referrer_amount  DECIMAL(12, 2) NOT NULL DEFAULT 0,
    notes            VARCHAR(255),
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loan_payments_loan_id ON loan_payments(loan_id);
