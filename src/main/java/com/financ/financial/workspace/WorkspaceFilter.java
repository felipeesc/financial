package com.financ.financial.workspace;

import com.financ.financial.user.User;
import com.financ.financial.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class WorkspaceFilter extends OncePerRequestFilter {

    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();
        // Auth endpoints: sem contexto de tenant
        if (path.startsWith("/api/auth/")) return true;
        // GET/POST /api/workspaces (listar e criar): operam no nivel do usuario, nao de um tenant especifico
        if (path.equals("/api/workspaces") && ("GET".equals(method) || "POST".equals(method))) return true;
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()
                    || "anonymousUser".equals(auth.getName())) {
                chain.doFilter(request, response);
                return;
            }

            Optional<User> userOpt = userRepository.findByUsername(auth.getName());
            if (userOpt.isEmpty()) {
                chain.doFilter(request, response);
                return;
            }
            UUID userId = userOpt.get().getId();

            String headerValue = request.getHeader("X-Workspace-Id");

            if (headerValue == null || headerValue.isBlank()) {
                // No header — auto-select user's owner workspace
                List<WorkspaceMember> memberships = workspaceMemberRepository.findByUserId(userId);
                if (memberships.isEmpty()) {
                    response.sendError(HttpStatus.FORBIDDEN.value(), "User has no workspace");
                    return;
                }
                WorkspaceMember defaultMembership = memberships.stream()
                        .filter(m -> m.getRole() == WorkspaceRole.OWNER)
                        .findFirst()
                        .orElse(memberships.get(0));
                TenantContext.setWorkspaceId(defaultMembership.getWorkspace().getId());
                TenantContext.setRole(defaultMembership.getRole());
                chain.doFilter(request, response);
                return;
            }

            UUID workspaceId;
            try {
                workspaceId = UUID.fromString(headerValue);
            } catch (IllegalArgumentException e) {
                response.sendError(HttpStatus.BAD_REQUEST.value(), "Invalid X-Workspace-Id");
                return;
            }

            Optional<WorkspaceMember> memberOpt =
                    workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId);
            if (memberOpt.isEmpty()) {
                response.sendError(HttpStatus.FORBIDDEN.value(), "Not a member of this workspace");
                return;
            }

            TenantContext.setWorkspaceId(workspaceId);
            TenantContext.setRole(memberOpt.get().getRole());
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
