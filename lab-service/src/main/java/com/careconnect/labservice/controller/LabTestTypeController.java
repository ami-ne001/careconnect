package com.careconnect.labservice.controller;

import com.careconnect.labservice.dto.LabTestTypeCreateRequest;
import com.careconnect.labservice.dto.LabTestTypeResponse;
import com.careconnect.labservice.dto.ReferenceRangeCreateRequest;
import com.careconnect.labservice.dto.ReferenceRangeResponse;
import com.careconnect.labservice.service.LabTestTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab/test-types")
@RequiredArgsConstructor
public class LabTestTypeController {

    private final LabTestTypeService testTypeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<LabTestTypeResponse> createTestType(@Valid @RequestBody LabTestTypeCreateRequest request) {
        return ResponseEntity.ok(testTypeService.createTestType(request));
    }

    @GetMapping
    public ResponseEntity<List<LabTestTypeResponse>> getAllTestTypes() {
        return ResponseEntity.ok(testTypeService.getAllTestTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabTestTypeResponse> getTestTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(testTypeService.getTestTypeById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTestType(@PathVariable Long id) {
        testTypeService.deleteTestType(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reference-ranges")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ReferenceRangeResponse> addReferenceRange(@PathVariable Long id, @Valid @RequestBody ReferenceRangeCreateRequest request) {
        // Ensure the path variable matches the request body
        if (!id.equals(request.getTestTypeId())) {
            request.setTestTypeId(id);
        }
        return ResponseEntity.ok(testTypeService.addReferenceRange(id, request));
    }

    @GetMapping("/{id}/reference-ranges")
    public ResponseEntity<List<ReferenceRangeResponse>> getReferenceRanges(@PathVariable Long id) {
        return ResponseEntity.ok(testTypeService.getReferenceRangesByTestType(id));
    }
}
