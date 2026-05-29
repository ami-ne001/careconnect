package com.careconnect.patientservice.service;

import com.careconnect.patientservice.dto.MedicalDocumentCreateRequest;
import com.careconnect.patientservice.dto.MedicalDocumentResponse;
import com.careconnect.patientservice.entity.MedicalDocument;
import com.careconnect.patientservice.entity.PatientProfile;
import com.careconnect.patientservice.exception.ResourceNotFoundException;
import com.careconnect.patientservice.repository.MedicalDocumentRepository;
import com.careconnect.patientservice.repository.PatientProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalDocumentService {

    private final MedicalDocumentRepository medicalDocumentRepository;
    private final PatientProfileRepository patientProfileRepository;

    @Transactional
    public MedicalDocumentResponse addDocument(MedicalDocumentCreateRequest request, Long uploadedByUserId) {
        PatientProfile patient = patientProfileRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found with id: " + request.getPatientId()));

        MedicalDocument doc = MedicalDocument.builder()
                .patientId(patient.getId())
                .uploadedBy(uploadedByUserId)
                .documentType(request.getDocumentType())
                .fileName(request.getFileName())
                .filePath(request.getFilePath())
                .description(request.getDescription())
                .build();

        return mapToResponse(medicalDocumentRepository.save(doc));
    }

    public List<MedicalDocumentResponse> getDocumentsByPatientId(Long patientId) {
        if (!patientProfileRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient profile not found with id: " + patientId);
        }
        return medicalDocumentRepository.findByPatientIdOrderByUploadedAtDesc(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public MedicalDocumentResponse getDocumentById(Long id) {
        MedicalDocument doc = medicalDocumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical document record not found with id: " + id));
        return mapToResponse(doc);
    }

    @Transactional
    public void deleteDocument(Long id) {
        if (!medicalDocumentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Medical document record not found with id: " + id);
        }
        medicalDocumentRepository.deleteById(id);
    }

    private MedicalDocumentResponse mapToResponse(MedicalDocument doc) {
        return MedicalDocumentResponse.builder()
                .id(doc.getId())
                .patientId(doc.getPatientId())
                .uploadedBy(doc.getUploadedBy())
                .documentType(doc.getDocumentType())
                .fileName(doc.getFileName())
                .filePath(doc.getFilePath())
                .description(doc.getDescription())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}
