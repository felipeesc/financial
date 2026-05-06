package com.financ.financial.workspace;

public enum WorkspaceRole {
    OWNER, ADMIN, MEMBER, VIEWER;

    public boolean canWrite() {
        return this == OWNER || this == ADMIN || this == MEMBER;
    }

    public boolean canManageMembers() {
        return this == OWNER || this == ADMIN;
    }

    public boolean isOwner() {
        return this == OWNER;
    }
}
