package com.careconnect.apigateway.filter;

import com.careconnect.apigateway.config.GatewaySecurityProperties;
import com.careconnect.apigateway.util.JwtUtil;
import com.careconnect.apigateway.util.UserClaims;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationGlobalFilter implements GlobalFilter, Ordered {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_USER_ROLE = "X-User-Role";
    private static final String HEADER_USER_EMAIL = "X-User-Email";

    private final JwtUtil jwtUtil;
    private final GatewaySecurityProperties securityProperties;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        String method = request.getMethod().name();

        // Browsers send OPTIONS before POST (CORS preflight) — must not require JWT
        if (HttpMethod.OPTIONS.matches(method)) {
            return chain.filter(exchange);
        }

        if (securityProperties.isPublic(method, path)) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            return unauthorized(exchange);
        }

        String token = authHeader.substring(BEARER_PREFIX.length());
        Optional<UserClaims> claims = jwtUtil.extractValidClaims(token);

        if (claims.isEmpty()) {
            return unauthorized(exchange);
        }

        UserClaims user = claims.get();
        ServerHttpRequest mutatedRequest = request.mutate()
                .header(HEADER_USER_ID, user.userId())
                .header(HEADER_USER_ROLE, user.role())
                .header(HEADER_USER_EMAIL, user.email())
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
