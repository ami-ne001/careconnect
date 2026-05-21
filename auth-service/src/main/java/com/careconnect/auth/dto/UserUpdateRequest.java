package com.careconnect.auth.dto;

import com.careconnect.auth.enums.Gender;
import com.careconnect.auth.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 60, message = "First name must not exceed 60 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 60, message = "Last name must not exceed 60 characters")
    private String lastName;

    @NotNull(message = "Role is required")
    private Role role;

    private Long departmentId;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    private Gender gender;

    private LocalDate dateOfBirth;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;
}
