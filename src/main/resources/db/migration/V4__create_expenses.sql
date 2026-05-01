CREATE TABLE expenses (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID         NOT NULL REFERENCES users(id),
    category_id       UUID         REFERENCES categories(id),
    payment_method_id UUID         REFERENCES payment_methods(id),
    description       VARCHAR(255) NOT NULL,
    amount            DECIMAL(10,2) NOT NULL,
    expense_date      DATE         NOT NULL,
    created_at        TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_id      ON expenses(user_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
