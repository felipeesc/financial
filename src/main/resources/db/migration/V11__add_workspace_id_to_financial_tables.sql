-- 1. Criar workspace "Pessoal" para cada usuario existente
INSERT INTO workspaces (id, name, owner_id, created_at)
SELECT gen_random_uuid(), 'Pessoal', id, NOW()
FROM users;

-- 2. Registrar cada usuario como OWNER do seu workspace
INSERT INTO workspace_members (id, workspace_id, user_id, role, joined_at)
SELECT gen_random_uuid(), w.id, w.owner_id, 'OWNER', NOW()
FROM workspaces w;

-- 3. Adicionar workspace_id (nullable durante migracao) nas tabelas financeiras
ALTER TABLE categories  ADD COLUMN workspace_id UUID;
ALTER TABLE expenses    ADD COLUMN workspace_id UUID;
ALTER TABLE fixed_costs ADD COLUMN workspace_id UUID;
ALTER TABLE loans       ADD COLUMN workspace_id UUID;

-- 4. Preencher workspace_id com base no user_id existente
UPDATE categories c
SET workspace_id = w.id
FROM workspaces w
WHERE w.owner_id = c.user_id;

UPDATE expenses e
SET workspace_id = w.id
FROM workspaces w
WHERE w.owner_id = e.user_id;

UPDATE fixed_costs fc
SET workspace_id = w.id
FROM workspaces w
WHERE w.owner_id = fc.user_id;

UPDATE loans l
SET workspace_id = w.id
FROM workspaces w
WHERE w.owner_id = l.user_id;

-- 4b. Verificar orfaos antes de tornar NOT NULL
-- Falha com mensagem clara se houver user_id sem workspace correspondente
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM categories WHERE workspace_id IS NULL) THEN
        RAISE EXCEPTION 'categories com workspace_id NULL apos migracao — verifique user_id orfaos';
    END IF;
    IF EXISTS (SELECT 1 FROM expenses WHERE workspace_id IS NULL) THEN
        RAISE EXCEPTION 'expenses com workspace_id NULL apos migracao — verifique user_id orfaos';
    END IF;
    IF EXISTS (SELECT 1 FROM fixed_costs WHERE workspace_id IS NULL) THEN
        RAISE EXCEPTION 'fixed_costs com workspace_id NULL apos migracao — verifique user_id orfaos';
    END IF;
    IF EXISTS (SELECT 1 FROM loans WHERE workspace_id IS NULL) THEN
        RAISE EXCEPTION 'loans com workspace_id NULL apos migracao — verifique user_id orfaos';
    END IF;
END $$;

-- 5. Tornar NOT NULL e adicionar FKs
ALTER TABLE categories ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE categories ADD CONSTRAINT fk_categories_workspace
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id);

ALTER TABLE expenses ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE expenses ADD CONSTRAINT fk_expenses_workspace
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id);

ALTER TABLE fixed_costs ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE fixed_costs ADD CONSTRAINT fk_fixed_costs_workspace
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id);

ALTER TABLE loans ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE loans ADD CONSTRAINT fk_loans_workspace
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id);
