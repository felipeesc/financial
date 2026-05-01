CREATE TABLE categories (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id),
    name       VARCHAR(100) NOT NULL,
    color      VARCHAR(7)   DEFAULT '#6366f1',
    created_at TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
