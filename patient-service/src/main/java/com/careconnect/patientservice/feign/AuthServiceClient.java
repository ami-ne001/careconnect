package com.careconnect.patientservice.feign;

import com.careconnect.patientservice.dto.UserSummaryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "auth-service", url = "${auth.service.url}")
public interface AuthServiceClient {

    @GetMapping("/api/internal/users/{id}")
    UserSummaryResponse getUserSummary(@PathVariable("id") Long id);
}
