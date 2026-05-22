package com.careconnect.clinicalservice.client;

import com.careconnect.clinicalservice.dto.PatientResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "patient-service", url = "${patient.service.url}")
public interface PatientServiceClient {

    @GetMapping("/api/internal/patients/{id}")
    PatientResponse getPatientById(@PathVariable("id") Long id);
}
