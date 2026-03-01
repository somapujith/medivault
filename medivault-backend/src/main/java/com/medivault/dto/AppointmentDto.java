package com.medivault.dto;

import lombok.Data;

import java.time.LocalDateTime;

public class AppointmentDto {

    @Data
    public static class CreateRequest {
        private String patientId;
        private Long doctorId;
        /**
         * ISO-8601 date-time string, e.g. 2026-03-02T10:30
         */
        private String startTime;
        /**
         * Optional ISO-8601 end time.
         */
        private String endTime;
        private String reason;
    }

    @Data
    public static class AppointmentResponse {
        private Long id;
        private String patientId;
        private String patientName;
        private Long doctorId;
        private String doctorName;
        private String doctorSpecialty;
        private String doctorHospital;
        private String reason;
        private String status;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private LocalDateTime createdAt;
    }
}

