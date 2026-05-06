package com.financ.financial.workspace;

import com.financ.financial.user.AuthenticatedUserResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public List<WorkspaceResponse> findAll() {
        return workspaceService.findWorkspacesForUser(userResolver.resolveId()).stream()
                .map(WorkspaceResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkspaceResponse create(@RequestBody CreateWorkspaceRequest request) {
        return WorkspaceResponse.from(
                workspaceService.create(userResolver.resolveId(), request.name()));
    }

    @PostMapping("/{id}/members")
    @ResponseStatus(HttpStatus.CREATED)
    public MemberResponse addMember(@PathVariable UUID id,
                                    @RequestBody AddMemberRequest request) {
        return MemberResponse.from(
                workspaceService.addMember(id, userResolver.resolveId(),
                        request.username(), request.role()));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(@PathVariable UUID id, @PathVariable UUID memberId) {
        workspaceService.removeMember(id, memberId, userResolver.resolveId());
    }

    record CreateWorkspaceRequest(String name) {}

    record AddMemberRequest(String username, WorkspaceRole role) {}

    record WorkspaceResponse(UUID id, String name, String ownerUsername, LocalDateTime createdAt) {
        static WorkspaceResponse from(Workspace w) {
            return new WorkspaceResponse(w.getId(), w.getName(),
                    w.getOwner().getUsername(), w.getCreatedAt());
        }
    }

    record MemberResponse(UUID id, String username, WorkspaceRole role) {
        static MemberResponse from(WorkspaceMember m) {
            return new MemberResponse(m.getId(), m.getUser().getUsername(), m.getRole());
        }
    }
}
