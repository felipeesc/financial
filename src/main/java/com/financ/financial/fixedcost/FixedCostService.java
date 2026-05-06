package com.financ.financial.fixedcost;

import com.financ.financial.user.AuthenticatedUserResolver;
import com.financ.financial.workspace.TenantContext;
import com.financ.financial.workspace.WorkspaceRepository;
import com.financ.financial.workspace.WorkspaceSecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FixedCostService {

    private final FixedCostRepository fixedCostRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceSecurityService workspaceSecurity;
    private final AuthenticatedUserResolver userResolver;

    @Transactional(readOnly = true)
    public List<FixedCost> findAll() {
        return fixedCostRepository.findByWorkspaceIdOrderByDueDayAscNameAsc(
                TenantContext.getWorkspaceId());
    }

    @Transactional(readOnly = true)
    public List<FixedCost> findAllActive() {
        return fixedCostRepository.findByWorkspaceIdAndActiveTrue(TenantContext.getWorkspaceId());
    }

    @Transactional
    public FixedCost create(String name, BigDecimal amount, Integer dueDay) {
        workspaceSecurity.requireWriteAccess();
        FixedCost fixedCost = FixedCost.builder()
                .user(userResolver.resolve())
                .workspace(workspaceRepository.getReferenceById(TenantContext.getWorkspaceId()))
                .name(name)
                .amount(amount)
                .dueDay(dueDay)
                .active(true)
                .build();
        return fixedCostRepository.save(fixedCost);
    }

    @Transactional
    public FixedCost update(UUID fixedCostId, String name, BigDecimal amount,
                            Integer dueDay, Boolean active) {
        workspaceSecurity.requireWriteAccess();
        FixedCost fixedCost = findOwned(fixedCostId);
        fixedCost.setName(name);
        fixedCost.setAmount(amount);
        fixedCost.setDueDay(dueDay);
        if (active != null) fixedCost.setActive(active);
        return fixedCostRepository.save(fixedCost);
    }

    @Transactional
    public void delete(UUID fixedCostId) {
        workspaceSecurity.requireWriteAccess();
        fixedCostRepository.delete(findOwned(fixedCostId));
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalMonthly() {
        return fixedCostRepository.findByWorkspaceIdAndActiveTrue(TenantContext.getWorkspaceId())
                .stream()
                .map(FixedCost::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private FixedCost findOwned(UUID fixedCostId) {
        return fixedCostRepository.findByIdAndWorkspaceId(fixedCostId, TenantContext.getWorkspaceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
