ALTER TABLE expenses DROP CONSTRAINT expenses_category_id_fkey;
ALTER TABLE expenses ADD CONSTRAINT expenses_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE expenses DROP CONSTRAINT expenses_payment_method_id_fkey;
ALTER TABLE expenses ADD CONSTRAINT expenses_payment_method_id_fkey
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL;
