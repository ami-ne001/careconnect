package com.careconnect.labservice.service;

import com.careconnect.labservice.dto.LabResultCreateRequest;
import com.careconnect.labservice.dto.LabResultResponse;
import com.careconnect.labservice.entity.LabRequest;
import com.careconnect.labservice.entity.LabResult;
import com.careconnect.labservice.enums.LabRequestStatus;
import com.careconnect.labservice.exception.BadRequestException;
import com.careconnect.labservice.exception.ResourceNotFoundException;
import com.careconnect.labservice.messaging.EventPublisher;
import com.careconnect.labservice.messaging.LabResultUploadedEvent;
import com.careconnect.labservice.repository.LabRequestRepository;
import com.careconnect.labservice.repository.LabResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LabResultService {

    private final LabResultRepository labResultRepository;
    private final LabRequestRepository labRequestRepository;
    private final EventPublisher eventPublisher;

    @Transactional
    public LabResultResponse uploadResult(LabResultCreateRequest request) {
        log.info("Uploading result for lab request ID: {}", request.getLabRequestId());

        LabRequest labRequest = labRequestRepository.findById(request.getLabRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Lab request not found with ID: " + request.getLabRequestId()));

        if (labRequest.getStatus() == LabRequestStatus.COMPLETED || labRequest.getStatus() == LabRequestStatus.CANCELLED) {
            throw new BadRequestException("Cannot upload results for lab request in status: " + labRequest.getStatus());
        }

        if (labResultRepository.findByLabRequest_Id(request.getLabRequestId()).isPresent()) {
            throw new BadRequestException("Result already uploaded for lab request ID: " + request.getLabRequestId());
        }

        LabResult labResult = LabResult.builder()
                .labRequest(labRequest)
                .technicianId(request.getTechnicianId())
                .resultData(request.getResultData())
                .interpretation(request.getInterpretation())
                .build();

        LabResult saved = labResultRepository.save(labResult);

        // Update request status
        labRequest.setStatus(LabRequestStatus.COMPLETED);
        labRequestRepository.save(labRequest);

        // Publish Event
        LabResultUploadedEvent event = LabResultUploadedEvent.builder()
                .labResultId(saved.getId())
                .labRequestId(labRequest.getId())
                .patientId(labRequest.getPatientId())
                .doctorId(labRequest.getDoctorId())
                .testType(labRequest.getTestType().getName())
                .technicianId(saved.getTechnicianId())
                .build();
        eventPublisher.publishLabResultUploaded(event);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public LabResultResponse getResultById(Long id) {
        LabResult result = labResultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab result not found with ID: " + id));
        return mapToResponse(result);
    }

    @Transactional(readOnly = true)
    public LabResultResponse getResultByLabRequestId(Long labRequestId) {
        LabResult result = labResultRepository.findByLabRequest_Id(labRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab result not found for lab request ID: " + labRequestId));
        return mapToResponse(result);
    }

    private LabResultResponse mapToResponse(LabResult entity) {
        return LabResultResponse.builder()
                .id(entity.getId())
                .labRequestId(entity.getLabRequest().getId())
                .technicianId(entity.getTechnicianId())
                .resultData(entity.getResultData())
                .interpretation(entity.getInterpretation())
                .uploadedAt(entity.getUploadedAt())
                .build();
    }
}
