package com.careconnect.patientservice.dto;

import com.careconnect.patientservice.enums.RoomStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomCreateRequest {

    @NotNull(message = "Ward ID is required")
    private Long wardId;

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotNull(message = "Bed count is required")
    private Integer bedCount;

    private RoomStatus status;
    private String notes;
}
