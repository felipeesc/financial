package com.financ.financial.workspace;

import com.financ.financial.user.User;
import com.financ.financial.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public Workspace create(UUID ownerUserId, String name) {
        User owner = userRepository.getReferenceById(ownerUserId);
        Workspace workspace = workspaceRepository.save(
                Workspace.builder().name(name).owner(owner).build());
        workspaceMemberRepository.save(WorkspaceMember.builder()
                .workspace(workspace)
                .user(owner)
                .role(WorkspaceRole.OWNER)
                .build());
        return workspace;
    }

    @Transactional(readOnly = true)
    public List<Workspace> findWorkspacesForUser(UUID userId) {
        return workspaceMemberRepository.findByUserId(userId).stream()
                .map(WorkspaceMember::getWorkspace)
                .toList();
    }

    @Transactional
    public WorkspaceMember addMember(UUID workspaceId, UUID requesterUserId,
                                     String username, WorkspaceRole role) {
        requireAdminOf(workspaceId, requesterUserId);

        if (role == WorkspaceRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Cannot assign OWNER role via addMember");
        }

        User invitee = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "User not found: " + username));

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, invitee.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already a member");
        }

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        return workspaceMemberRepository.save(WorkspaceMember.builder()
                .workspace(workspace)
                .user(invitee)
                .role(role)
                .invitedBy(userRepository.getReferenceById(requesterUserId))
                .build());
    }

    @Transactional
    public void removeMember(UUID workspaceId, UUID memberId, UUID requesterUserId) {
        requireAdminOf(workspaceId, requesterUserId);

        WorkspaceMember member = workspaceMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!member.getWorkspace().getId().equals(workspaceId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        if (member.getRole() == WorkspaceRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot remove the owner");
        }

        workspaceMemberRepository.delete(member);
    }

    private void requireAdminOf(UUID workspaceId, UUID userId) {
        WorkspaceMember requester = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Not a member of this workspace"));
        if (!requester.getRole().canManageMembers()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
