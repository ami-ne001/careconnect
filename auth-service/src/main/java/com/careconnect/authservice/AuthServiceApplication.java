package com.careconnect.authservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.careconnect.auth", "com.careconnect.authservice"})
@EntityScan(basePackages = "com.careconnect.auth")
@EnableJpaRepositories(basePackages = "com.careconnect.auth")
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

}
