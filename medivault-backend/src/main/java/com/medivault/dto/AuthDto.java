package com.medivault.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthDto {

    @Data
    public static class LoginRequest {
        @Email @NotBlank
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @NotBlank private String password;
        @NotBlank private String role; // PATIENT, DOCTOR, ADMIN
        private String specialty;
        private String license;
        private String hospital;
        private String phone;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String name;
        private String email;
        private String role;
        private String specialty;
        private String license;
        private String hospital;
        private String phone;

        public AuthResponse(String token, Long id, String name, String email,
                            String role, String specialty, String license,
                            String hospital, String phone) {
            this.token = token;
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
            this.specialty = specialty;
            this.license = license;
            this.hospital = hospital;
            this.phone = phone;
        }
    }
}
