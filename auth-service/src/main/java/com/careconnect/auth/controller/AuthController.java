package com.careconnect.auth.controller;

import com.careconnect.auth.dto.ForgotPasswordRequest;
import com.careconnect.auth.dto.LoginRequest;
import com.careconnect.auth.dto.LoginResponse;
import com.careconnect.auth.dto.ResetPasswordRequest;
import com.careconnect.auth.dto.UserResponse;
import com.careconnect.auth.dto.UserUpdateRequest;
import com.careconnect.auth.service.AdminUserService;
import com.careconnect.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AdminUserService adminUserService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        
        long maxAge = (Boolean.TRUE.equals(request.getRememberMe())) ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7 days or 1 day
        
        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("remember-me", response.getToken())
                .httpOnly(true)
                .secure(false) // Assuming HTTP for local dev; change to true for HTTPS
                .path("/")
                .maxAge(maxAge)
                .build();
                
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(adminUserService.getUserById(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            Authentication authentication,
            @Valid @RequestBody UserUpdateRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(adminUserService.updateMyProfile(userId, request));
    }

    @GetMapping("/admin-only")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminOnly() {
        return ResponseEntity.ok("Hello Admin! You have successfully accessed this secured endpoint.");
    }
}
