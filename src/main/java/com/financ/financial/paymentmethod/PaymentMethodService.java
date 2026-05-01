package com.financ.financial.paymentmethod;

import com.financ.financial.user.User;
import com.financ.financial.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;
    private final UserRepository userRepository;

    public List<PaymentMethod> findAll(UUID userId) {
        return paymentMethodRepository.findByUserId(userId);
    }

    public PaymentMethod create(UUID userId, String name) {
        User user = userRepository.getReferenceById(userId);
        PaymentMethod paymentMethod = PaymentMethod.builder()
                .user(user)
                .name(name)
                .build();
        return paymentMethodRepository.save(paymentMethod);
    }

    public void delete(UUID paymentMethodId, UUID userId) {
        PaymentMethod paymentMethod = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!paymentMethod.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        paymentMethodRepository.delete(paymentMethod);
    }
}
