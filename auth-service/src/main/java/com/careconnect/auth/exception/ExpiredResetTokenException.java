package com.careconnect.auth.exception;

public class ExpiredResetTokenException extends RuntimeException {

    public ExpiredResetTokenException(String message) {
        super(message);
    }
}
