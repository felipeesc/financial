package com.financ.financial.paymentmethod;

import com.financ.financial.user.AuthenticatedUserResolver;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment-methods")
@RequiredArgsConstructor
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;
    private final AuthenticatedUserResolver userResolver;

    @GetMapping
    public List<PaymentMethodResponse> findAll() {
        return paymentMethodService.findAll(userResolver.resolveId()).stream()
                .map(PaymentMethodResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentMethodResponse create(@Valid @RequestBody PaymentMethodRequest request) {
        return PaymentMethodResponse.from(
                paymentMethodService.create(userResolver.resolveId(), request.name()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        paymentMethodService.delete(id, userResolver.resolveId());
    }

    record PaymentMethodRequest(@NotBlank String name) {}
}
