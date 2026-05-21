package com.careconnect.apigateway.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Public routes whitelist. Each entry: {@code METHOD:path} (e.g. {@code POST:/api/auth/login}).
 */
@Component
@ConfigurationProperties(prefix = "gateway.security")
@Getter
@Setter
public class GatewaySecurityProperties {

    /**
     * From application.properties, e.g. gateway.security.public-routes[0]=POST:/api/auth/login
     */
    private List<String> publicRoutes = new ArrayList<>();

    private final Set<String> publicRouteKeys = new HashSet<>();

    @PostConstruct
    void init() {
        publicRouteKeys.clear();
        for (String entry : publicRoutes) {
            if (entry == null || entry.isBlank()) {
                continue;
            }
            String trimmed = entry.trim();
            int colon = trimmed.indexOf(':');
            if (colon <= 0 || colon == trimmed.length() - 1) {
                throw new IllegalArgumentException(
                        "Invalid public route entry '" + entry + "'. Expected format: METHOD:path");
            }
            String method = trimmed.substring(0, colon).trim().toUpperCase();
            String path = trimmed.substring(colon + 1).trim();
            publicRouteKeys.add(method + ":" + path);
        }
    }

    public boolean isPublic(String httpMethod, String path) {
        return publicRouteKeys.contains(httpMethod.toUpperCase() + ":" + path);
    }
}
