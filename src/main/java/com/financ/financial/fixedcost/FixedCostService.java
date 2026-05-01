package com.financ.financial.fixedcost;

import com.financ.financial.user.UserRepository;
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
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<FixedCost> findAll(UUID userId) {
        return fixedCostRepository.findByUserIdAndActiveTrue(userId);
    }

    @Transactional
    public FixedCost create(UUID userId, String name, BigDecimal amount, Integer dueDay) {
        FixedCost fixedCost = FixedCost.builder()
                .user(userRepository.getReferenceById(userId))
                .name(name)
                .amount(amount)
                .dueDay(dueDay)
                .active(true)
                .build();
        return fixedCostRepository.save(fixedCost);
    }

    @Transactional
    public FixedCost update(UUID fixedCostId, UUID userId,
                            String name, BigDecimal amount, Integer dueDay, Boolean active) {
        FixedCost fixedCost = findOwned(fixedCostId, userId);
        fixedCost.setName(name);
        fixedCost.setAmount(amount);
        fixedCost.setDueDay(dueDay);
        if (active != null) fixedCost.setActive(active);
        return fixedCostRepository.save(fixedCost);
    }

    @Transactional
    public void delete(UUID fixedCostId, UUID userId) {
        fixedCostRepository.delete(findOwned(fixedCostId, userId));
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalMonthly(UUID userId) {
        return fixedCostRepository.findByUserIdAndActiveTrue(userId).stream()
                .map(FixedCost::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private FixedCost findOwned(UUID fixedCostId, UUID userId) {
        FixedCost fixedCost = fixedCostRepository.findById(fixedCostId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!fixedCost.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return fixedCost;
    }
}
