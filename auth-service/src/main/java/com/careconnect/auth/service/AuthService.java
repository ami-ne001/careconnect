package com.careconnect.auth.service;

import com.careconnect.auth.dto.LoginRequest;
import com.careconnect.auth.dto.LoginResponse;
import com.careconnect.auth.entity.User;
import com.careconnect.auth.exception.InvalidCredentialsException;
import com.careconnect.auth.repository.UserRepository;
import com.careconnect.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(
                user.getId().toString(),
                user.getRole().name(),
                user.getEmail()
        );

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .role(user.getRole().name())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}
