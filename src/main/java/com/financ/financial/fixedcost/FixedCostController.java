package com.financ.financial.fixedcost;

import com.financ.financial.user.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/fixed-costs")
@RequiredArgsConstructor
public class FixedCostController {

    private final FixedCostService fixedCostService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public List<FixedCostResponse> findAll() {
        return fixedCostService.findAll(userResolver.resolveId()).stream()
                .map(FixedCostResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FixedCostResponse create(@Valid @RequestBody CreateRequest request) {
        return FixedCostResponse.from(fixedCostService.create(
                userResolver.resolveId(), request.name(), request.amount(), request.dueDay()));
    }

    @PutMapping("/{id}")
    public FixedCostResponse update(@PathVariable UUID id,
                                    @Valid @RequestBody UpdateRequest request) {
        return FixedCostResponse.from(fixedCostService.update(
                id, userResolver.resolveId(),
                request.name(), request.amount(), request.dueDay(), request.active()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        fixedCostService.delete(id, userResolver.resolveId());
    }

    record CreateRequest(
            @NotBlank String name,
            @NotNull @DecimalMin("0.01") BigDecimal amount,
            @Min(1) @Max(31) Integer dueDay
    ) {}

    record UpdateRequest(
            @NotBlank String name,
            @NotNull @DecimalMin("0.01") BigDecimal amount,
            @Min(1) @Max(31) Integer dueDay,
            Boolean active
    ) {}
}
