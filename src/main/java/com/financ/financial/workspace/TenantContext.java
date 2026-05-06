package com.financ.financial.workspace;

import java.util.UUID;

public class TenantContext {

    private static final ThreadLocal<UUID> WORKSPACE_ID = new ThreadLocal<>();
    private static final ThreadLocal<WorkspaceRole> ROLE = new ThreadLocal<>();

    private TenantContext() {}

    public static void setWorkspaceId(UUID id) { WORKSPACE_ID.set(id); }

    public static UUID getWorkspaceId() {
        UUID id = WORKSPACE_ID.get();
        if (id == null) throw new IllegalStateException("No workspace in context");
        return id;
    }

    public static UUID getWorkspaceIdOrNull() { return WORKSPACE_ID.get(); }

    public static void setRole(WorkspaceRole r) { ROLE.set(r); }

    public static WorkspaceRole getRole() { return ROLE.get(); }

    public static void clear() {
        WORKSPACE_ID.remove();
        ROLE.remove();
    }
}
