package com.careconnect.patientservice.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Blood type enum. SQL stores values like 'A+', 'A-', etc.
 * Since Java enum names cannot contain '+'/'-', we store the raw string
 * in the entity and use this enum only in DTOs for validation/display.
 */
public enum BloodType {

    A_PLUS("A+"),
    A_MINUS("A-"),
    B_PLUS("B+"),
    B_MINUS("B-"),
    AB_PLUS("AB+"),
    AB_MINUS("AB-"),
    O_PLUS("O+"),
    O_MINUS("O-");

    private final String value;

    BloodType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static BloodType fromValue(String value) {
        for (BloodType bt : values()) {
            if (bt.value.equalsIgnoreCase(value)) {
                return bt;
            }
        }
        throw new IllegalArgumentException("Unknown blood type: " + value);
    }
}
