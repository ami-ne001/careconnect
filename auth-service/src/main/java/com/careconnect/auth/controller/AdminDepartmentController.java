package com.careconnect.auth.controller;

import com.careconnect.auth.dto.DepartmentCreateRequest;
import com.careconnect.auth.dto.DepartmentResponse;
import com.careconnect.auth.dto.DepartmentUpdateRequest;
import com.careconnect.auth.service.AdminDepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/departments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDepartmentController {

    private final AdminDepartmentService adminDepartmentService;

    @PostMapping
    public ResponseEntity<DepartmentResponse> createDepartment(@Valid @RequestBody DepartmentCreateRequest request) {
        DepartmentResponse response = adminDepartmentService.createDepartment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<DepartmentResponse>> getAllDepartments() {
        return ResponseEntity.ok(adminDepartmentService.getAllDepartments());
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartmentResponse> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentUpdateRequest request) {
        return ResponseEntity.ok(adminDepartmentService.updateDepartment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        adminDepartmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}
