CREATE TABLE workspaces (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    owner_id    UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE workspace_members (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(id),
    role          VARCHAR(10) NOT NULL DEFAULT 'MEMBER'
                  CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
    invited_by    UUID REFERENCES users(id),
    joined_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_user_id       ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace_id  ON workspace_members(workspace_id);
CREATE INDEX idx_workspaces_owner_id             ON workspaces(owner_id);
