package com.medivault.dto;

import lombok.Data;
import java.util.List;

public class PrescriptionDto {

    @Data
    public static class CreateRequest {
        private String patientId;
        private String visitReason;
        private String symptoms;
        private String diagnosis;
        private String notes;
        private String followUp;
        private List<MedicationItem> medications;
        private List<String> labTests;
    }

    @Data
    public static class MedicationItem {
        private String name;
        private String dose;
        private String frequency;
        private String duration;
        private String instructions;
    }

    @Data
    public static class PrescriptionResponse {
        private String id;
        private String patientId;
        private String patientName;
        private Long doctorId;
        private String doctorName;
        private String doctorSpecialty;
        private String doctorLicense;
        private String doctorHospital;
        private String doctorPhone;
        private String visitReason;
        private String symptoms;
        private String diagnosis;
        private String notes;
        private String followUp;
        private String status;
        private String issuedAt;
        private List<MedicationItem> medications;
        private List<String> labTests;
    }
}
