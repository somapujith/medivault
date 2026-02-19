package com.medivault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @Column(nullable = false, unique = true)
    private String id; // e.g. RX001

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    // Doctor snapshot (in case doctor profile changes)
    private String doctorName;
    private String doctorSpecialty;
    private String doctorLicense;
    private String doctorHospital;
    private String doctorPhone;

    private String visitReason;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(nullable = false)
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String followUp;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.ACTIVE;

    private LocalDateTime issuedAt;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Medication> medications;

    @ElementCollection
    @CollectionTable(name = "prescription_lab_tests", joinColumns = @JoinColumn(name = "prescription_id"))
    @Column(name = "test_name")
    private List<String> labTests;

    @PrePersist
    public void prePersist() {
        if (issuedAt == null) issuedAt = LocalDateTime.now();
    }

    public enum Status {
        ACTIVE, COMPLETED, CANCELLED
    }
}
