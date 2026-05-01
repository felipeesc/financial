CREATE TABLE fixed_costs (
    id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID          NOT NULL REFERENCES users(id),
    name       VARCHAR(100)  NOT NULL,
    amount     DECIMAL(10,2) NOT NULL,
    due_day    INTEGER,
    active     BOOLEAN       DEFAULT TRUE,
    created_at TIMESTAMP     DEFAULT NOW()
);

CREATE INDEX idx_fixed_costs_user_id ON fixed_costs(user_id);
