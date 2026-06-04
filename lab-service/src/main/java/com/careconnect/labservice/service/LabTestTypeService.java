package com.careconnect.labservice.service;

import com.careconnect.labservice.dto.LabTestTypeCreateRequest;
import com.careconnect.labservice.dto.LabTestTypeResponse;
import com.careconnect.labservice.dto.ReferenceRangeCreateRequest;
import com.careconnect.labservice.dto.ReferenceRangeResponse;
import com.careconnect.labservice.entity.LabTestReferenceRange;
import com.careconnect.labservice.entity.LabTestType;
import com.careconnect.labservice.exception.BadRequestException;
import com.careconnect.labservice.exception.ResourceNotFoundException;
import com.careconnect.labservice.repository.LabTestReferenceRangeRepository;
import com.careconnect.labservice.repository.LabTestTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LabTestTypeService {

    private final LabTestTypeRepository testTypeRepository;
    private final LabTestReferenceRangeRepository referenceRangeRepository;

    @Transactional
    public LabTestTypeResponse createTestType(LabTestTypeCreateRequest request) {
        log.info("Creating lab test type: {}", request.getName());
        if (testTypeRepository.findByName(request.getName()).isPresent()) {
            throw new BadRequestException("Test type with name '" + request.getName() + "' already exists");
        }

        LabTestType testType = LabTestType.builder()
                .name(request.getName())
                .category(request.getCategory())
                .sampleType(request.getSampleType())
                .description(request.getDescription())
                .build();

        return mapToResponse(testTypeRepository.save(testType));
    }

    @Transactional(readOnly = true)
    public LabTestTypeResponse getTestTypeById(Long id) {
        LabTestType testType = testTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test type not found with ID: " + id));
        return mapToResponse(testType);
    }

    @Transactional
    public LabTestTypeResponse updateTestType(Long id, LabTestTypeCreateRequest request) {
        LabTestType testType = testTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test type not found with ID: " + id));
        
        // Check if name is changed and if new name already exists
        if (!testType.getName().equals(request.getName()) && testTypeRepository.findByName(request.getName()).isPresent()) {
            throw new BadRequestException("Test type with name '" + request.getName() + "' already exists");
        }

        testType.setName(request.getName());
        testType.setCategory(request.getCategory());
        testType.setSampleType(request.getSampleType());
        testType.setDescription(request.getDescription());

        return mapToResponse(testTypeRepository.save(testType));
    }

    @Transactional(readOnly = true)
    public List<LabTestTypeResponse> getAllTestTypes() {
        return testTypeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteTestType(Long id) {
        if (!testTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Test type not found with ID: " + id);
        }
        testTypeRepository.deleteById(id);
    }

    @Transactional
    public ReferenceRangeResponse addReferenceRange(Long testTypeId, ReferenceRangeCreateRequest request) {
        LabTestType testType = testTypeRepository.findById(testTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Test type not found with ID: " + testTypeId));

        LabTestReferenceRange range = LabTestReferenceRange.builder()
                .testType(testType)
                .component(request.getComponent())
                .unit(request.getUnit())
                .minValue(request.getMinValue())
                .maxValue(request.getMaxValue())
                .gender(request.getGender())
                .notes(request.getNotes())
                .build();

        return mapToResponse(referenceRangeRepository.save(range));
    }

    @Transactional(readOnly = true)
    public List<ReferenceRangeResponse> getReferenceRangesByTestType(Long testTypeId) {
        return referenceRangeRepository.findByTestType_Id(testTypeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private LabTestTypeResponse mapToResponse(LabTestType entity) {
        return LabTestTypeResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .category(entity.getCategory())
                .sampleType(entity.getSampleType())
                .description(entity.getDescription())
                .build();
    }

    private ReferenceRangeResponse mapToResponse(LabTestReferenceRange entity) {
        return ReferenceRangeResponse.builder()
                .id(entity.getId())
                .testTypeId(entity.getTestType().getId())
                .component(entity.getComponent())
                .unit(entity.getUnit())
                .minValue(entity.getMinValue())
                .maxValue(entity.getMaxValue())
                .gender(entity.getGender())
                .notes(entity.getNotes())
                .build();
    }
}
