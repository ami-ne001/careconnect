package com.careconnect.auth.controller;

import com.careconnect.auth.dto.UserCreateRequest;
import com.careconnect.auth.dto.UserResponse;
import com.careconnect.auth.dto.UserUpdateRequest;
import com.careconnect.auth.enums.Role;
import com.careconnect.auth.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isReceptionist = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_RECEPTIONIST"));
        if (isReceptionist && request.getRole() != Role.PATIENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Receptionists can only create PATIENT accounts");
        }
        UserResponse response = adminUserService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN')")
    public ResponseEntity<List<UserResponse>> getAllUsers(@RequestParam(required = false) Role role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdminOrReceptionist = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_RECEPTIONIST"));
        boolean isDoctor = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));
        if (!isAdminOrReceptionist && !isDoctor && role != Role.DOCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Non-admin/receptionist users can only view DOCTOR profiles");
        }
        if (isDoctor && !isAdminOrReceptionist && role != Role.DOCTOR && role != Role.NURSE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Doctors can only view DOCTOR and NURSE profiles");
        }
        return ResponseEntity.ok(adminUserService.getAllUsers(role));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.getUserById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(adminUserService.updateUser(id, request));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.deactivateUser(id));
    }
}
