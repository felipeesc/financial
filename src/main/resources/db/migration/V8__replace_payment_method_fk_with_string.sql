ALTER TABLE expenses ADD COLUMN payment_method VARCHAR(50);

UPDATE expenses e
    SET payment_method = pm.name
    FROM payment_methods pm
    WHERE e.payment_method_id = pm.id;

ALTER TABLE expenses DROP COLUMN payment_method_id;
