package com.careconnect.auth.service;

import com.careconnect.auth.entity.PasswordResetToken;
import com.careconnect.auth.entity.User;
import com.careconnect.auth.exception.ExpiredResetTokenException;
import com.careconnect.auth.exception.InvalidResetTokenException;
import com.careconnect.auth.exception.UserNotFoundException;
import com.careconnect.auth.repository.PasswordResetTokenRepository;
import com.careconnect.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.password-reset.expiration-minutes:60}")
    private int expirationMinutes;

    @Transactional
    public void requestReset(String email) {
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new UserNotFoundException("No account found with this email address"));

        tokenRepository.deleteByUser_Id(user.getId());

        String token = generateToken();
        LocalDateTime now = LocalDateTime.now();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiresAt(now.plusMinutes(expirationMinutes))
                .createdAt(now)
                .build();

        tokenRepository.save(resetToken);
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByTokenAndUsedAtIsNull(token.trim())
                .orElseThrow(() -> new InvalidResetTokenException("Invalid or already used reset token"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ExpiredResetTokenException("Reset token has expired. Please request a new password reset.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
