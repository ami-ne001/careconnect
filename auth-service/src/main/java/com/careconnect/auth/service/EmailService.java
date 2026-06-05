package com.careconnect.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = frontendBaseUrl + "/auth/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("CareConnect — Reset your password");
        message.setText(
                "Hello,\n\n"
                        + "We received a request to reset your CareConnect password.\n\n"
                        + "Click the link below to choose a new password (valid for 60 minutes):\n"
                        + resetUrl
                        + "\n\n"
                        + "If you did not request this, you can ignore this email.\n\n"
                        + "— CareConnect Hospital System"
        );

        mailSender.send(message);
        log.info("Password reset email sent to {}", toEmail);
    }
}
