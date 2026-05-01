package com.financ.financial.paymentmethod;

import com.financ.financial.user.AuthenticatedUserResolver;
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
    public List<PaymentMethod> findAll() {
        return paymentMethodService.findAll(userResolver.resolveId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentMethod create(@RequestBody PaymentMethodRequest request) {
        return paymentMethodService.create(userResolver.resolveId(), request.name());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        paymentMethodService.delete(id, userResolver.resolveId());
    }

    record PaymentMethodRequest(String name) {}
}
