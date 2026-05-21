package com.careconnect.auth.service;

import com.careconnect.auth.dto.DepartmentCreateRequest;
import com.careconnect.auth.dto.DepartmentResponse;
import com.careconnect.auth.dto.DepartmentUpdateRequest;
import com.careconnect.auth.entity.Department;
import com.careconnect.auth.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentResponse createDepartment(DepartmentCreateRequest request) {
        if (departmentRepository.findByName(request.getName()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Department name already exists");
        }

        Department department = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Department saved = departmentRepository.save(department);
        return mapToResponse(saved);
    }

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DepartmentResponse updateDepartment(Long id, DepartmentUpdateRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));

        if (!department.getName().equalsIgnoreCase(request.getName())) {
            if (departmentRepository.findByName(request.getName()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Department name already exists");
            }
        }

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        Department updated = departmentRepository.save(department);
        return mapToResponse(updated);
    }

    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));

        departmentRepository.delete(department);
    }

    private DepartmentResponse mapToResponse(Department department) {
        return DepartmentResponse.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .createdAt(department.getCreatedAt())
                .build();
    }
}
