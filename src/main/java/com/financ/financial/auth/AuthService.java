package com.financ.financial.auth;

import com.financ.financial.category.Category;
import com.financ.financial.category.CategoryRepository;
import com.financ.financial.user.User;
import com.financ.financial.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CategoryRepository categoryRepository;

    private static final List<String[]> DEFAULT_CATEGORIES = List.of(
            new String[]{"Alimentação",       "#10b981"},
            new String[]{"Transporte",        "#0ea5e9"},
            new String[]{"Vestuário",         "#8b5cf6"},
            new String[]{"Lazer",             "#f59e0b"},
            new String[]{"Investimento",      "#6366f1"},
            new String[]{"Cartão de Crédito", "#ef4444"},
            new String[]{"Financiamento",     "#f97316"},
            new String[]{"Saúde",             "#14b8a6"},
            new String[]{"Educação",          "#3b82f6"},
            new String[]{"Cuidados Pessoais", "#ec4899"},
            new String[]{"Manutenção Carro",  "#64748b"},
            new String[]{"Impostos",          "#dc2626"},
            new String[]{"Assinaturas",       "#7c3aed"},
            new String[]{"Presentes",         "#db2777"},
            new String[]{"Outro",             "#94a3b8"}
    );

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles("USER")
                .build();
    }

    public String login(String username, String rawPassword) {
        UserDetails userDetails = loadUserByUsername(username);

        if (!passwordEncoder.matches(rawPassword, userDetails.getPassword())) {
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid credentials");
        }

        return jwtUtil.generateToken(username);
    }

    @Transactional
    public User register(String username, String rawPassword) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Username already taken: " + username);
        }

        User user = userRepository.save(User.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .build());

        List<Category> defaults = DEFAULT_CATEGORIES.stream()
                .map(c -> Category.builder()
                        .user(user)
                        .name(c[0])
                        .color(c[1])
                        .build())
                .toList();
        categoryRepository.saveAll(defaults);

        return user;
    }
}
