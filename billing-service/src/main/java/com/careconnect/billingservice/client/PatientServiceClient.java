package com.careconnect.billingservice.client;

import com.careconnect.billingservice.dto.PatientSummaryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "patient-service", url = "${patient.service.url}")
public interface PatientServiceClient {

    @GetMapping("/api/internal/patients/user/{id}")
    PatientSummaryResponse getPatientSummary(@PathVariable("id") Long id);
}
