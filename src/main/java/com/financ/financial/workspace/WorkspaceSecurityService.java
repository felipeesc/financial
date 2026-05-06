package com.financ.financial.workspace;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class WorkspaceSecurityService {

    public void requireWriteAccess() {
        WorkspaceRole role = TenantContext.getRole();
        if (role == null || !role.canWrite()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Write access required");
        }
    }

    public void requireMemberManagement() {
        WorkspaceRole role = TenantContext.getRole();
        if (role == null || !role.canManageMembers()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }

    public void requireOwner() {
        WorkspaceRole role = TenantContext.getRole();
        if (role == null || !role.isOwner()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Owner access required");
        }
    }
}
