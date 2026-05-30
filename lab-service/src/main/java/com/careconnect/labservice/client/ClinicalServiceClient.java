package com.careconnect.labservice.client;

import com.careconnect.labservice.dto.ConsultationSummaryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "clinical-service", url = "${clinical.service.url}")
public interface ClinicalServiceClient {

    @GetMapping("/api/internal/consultations/{id}")
    ConsultationSummaryResponse getConsultationSummary(@PathVariable("id") Long id);
}
