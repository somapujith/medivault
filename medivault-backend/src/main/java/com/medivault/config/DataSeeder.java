package com.medivault.config;

import com.medivault.entity.*;
import com.medivault.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Seeds the H2 in-memory database with demo data on startup.
 * Mirrors the mock data from the React frontend's DataContext.jsx and
 * AuthContext.jsx.
 */
@Component
public class DataSeeder implements CommandLineRunner {

        @Autowired
        private UserRepository userRepository;
        @Autowired
        private PatientRepository patientRepository;
        @Autowired
        private PrescriptionRepository prescriptionRepository;
        @Autowired
        private DocumentRepository documentRepository;
        @Autowired
        private PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) {
                // ── Users ──────────────────────────────────────────────────────────────
                User patient1 = userRepository.save(User.builder()
                                .name("Alex Johnson").email("patient@medivault.com")
                                .password(passwordEncoder.encode("patient123"))
                                .role(User.Role.PATIENT).phone("+1 (555) 123-4567").build());

                User doctor1 = userRepository.save(User.builder()
                                .name("Dr. Sarah Mitchell").email("doctor@medivault.com")
                                .password(passwordEncoder.encode("doctor123"))
                                .role(User.Role.DOCTOR).specialty("Cardiology")
                                .license("MD-2024-001").hospital("MediVault General Hospital")
                                .phone("+1 (555) 987-6543").build());

                userRepository.save(User.builder()
                                .name("James Carter").email("admin@medivault.com")
                                .password(passwordEncoder.encode("admin123"))
                                .role(User.Role.ADMIN).phone("+1 (555) 456-7890").build());

                User patient2 = userRepository.save(User.builder()
                                .name("Maria Garcia").email("maria@medivault.com")
                                .password(passwordEncoder.encode("patient123"))
                                .role(User.Role.PATIENT).phone("+1 (555) 234-5678").build());

                User patient3 = userRepository.save(User.builder()
                                .name("Robert Chen").email("robert@medivault.com")
                                .password(passwordEncoder.encode("patient123"))
                                .role(User.Role.PATIENT).phone("+1 (555) 345-6789").build());

                // ── Patients ───────────────────────────────────────────────────────────
                Patient p1 = patientRepository.save(Patient.builder()
                                .id("P001").user(patient1).name("Alex Johnson")
                                .dob(LocalDate.of(1990, 5, 15)).gender("Male").bloodGroup("O+")
                                .phone("+1 (555) 123-4567").email("patient@medivault.com")
                                .address("123 Main St, New York, NY 10001")
                                .allergies(List.of("Penicillin", "Sulfa drugs"))
                                .chronicConditions(List.of("Hypertension", "Type 2 Diabetes"))
                                .emergencyContactName("Jane Johnson").emergencyContactRelation("Spouse")
                                .emergencyContactPhone("+1 (555) 765-4321")
                                .insuranceId("INS-2024-AJ001").build());

                Patient p2 = patientRepository.save(Patient.builder()
                                .id("P002").user(patient2).name("Maria Garcia")
                                .dob(LocalDate.of(1975, 11, 22)).gender("Female").bloodGroup("A+")
                                .phone("+1 (555) 234-5678").email("maria@medivault.com")
                                .address("456 Oak Ave, Los Angeles, CA 90001")
                                .allergies(List.of("Aspirin"))
                                .chronicConditions(List.of("Asthma"))
                                .emergencyContactName("Carlos Garcia").emergencyContactRelation("Husband")
                                .emergencyContactPhone("+1 (555) 876-5432")
                                .insuranceId("INS-2024-MG002").build());

                patientRepository.save(Patient.builder()
                                .id("P003").user(patient3).name("Robert Chen")
                                .dob(LocalDate.of(1988, 3, 8)).gender("Male").bloodGroup("B+")
                                .phone("+1 (555) 345-6789").email("robert@medivault.com")
                                .address("789 Pine Rd, Chicago, IL 60601")
                                .allergies(List.of())
                                .chronicConditions(List.of("Anxiety Disorder"))
                                .emergencyContactName("Linda Chen").emergencyContactRelation("Mother")
                                .emergencyContactPhone("+1 (555) 987-6543")
                                .insuranceId("INS-2024-RC003").build());

                // ── Prescriptions ──────────────────────────────────────────────────────
                Prescription rx1 = Prescription.builder()
                                .id("RX001").patient(p1).doctor(doctor1)
                                .doctorName("Dr. Sarah Mitchell").doctorSpecialty("Cardiology")
                                .doctorLicense("MD-2024-001").doctorHospital("MediVault General Hospital")
                                .doctorPhone("+1 (555) 987-6543")
                                .visitReason("Routine cardiac check-up and blood pressure review")
                                .symptoms("Patient reports occasional chest tightness, mild shortness of breath on exertion. BP elevated at 145/92.")
                                .diagnosis("Hypertension Stage 1, Mild cardiac stress")
                                .notes("Patient advised to reduce sodium intake, exercise 30 min/day, monitor BP at home daily.")
                                .followUp("2026-04-20")
                                .labTests(List.of("Complete Blood Count", "Lipid Panel", "ECG"))
                                .status(Prescription.Status.ACTIVE)
                                .build();

                List<Medication> meds1 = List.of(
                                Medication.builder().prescription(rx1).name("Lisinopril").dose("10mg")
                                                .frequency("Once daily (morning)").duration("90 days")
                                                .instructions("Take with water, avoid potassium supplements").build(),
                                Medication.builder().prescription(rx1).name("Amlodipine").dose("5mg")
                                                .frequency("Once daily (evening)").duration("90 days")
                                                .instructions("Monitor for ankle swelling").build());
                rx1.setMedications(meds1);
                prescriptionRepository.save(rx1);

                Prescription rx2 = Prescription.builder()
                                .id("RX002").patient(p1).doctor(doctor1)
                                .doctorName("Dr. Sarah Mitchell").doctorSpecialty("Cardiology")
                                .doctorLicense("MD-2024-001").doctorHospital("MediVault General Hospital")
                                .doctorPhone("+1 (555) 987-6543")
                                .visitReason("Follow-up after ECG results")
                                .symptoms("Mild palpitations reported. ECG shows minor irregularity.")
                                .diagnosis("Mild arrhythmia, under observation")
                                .notes("Avoid caffeine and alcohol. Report any worsening palpitations immediately.")
                                .followUp("2025-11-05")
                                .labTests(List.of("Holter Monitor (24hr)", "Echocardiogram"))
                                .status(Prescription.Status.COMPLETED)
                                .build();

                List<Medication> meds2 = List.of(
                                Medication.builder().prescription(rx2).name("Metoprolol").dose("25mg")
                                                .frequency("Twice daily").duration("30 days")
                                                .instructions("Do not stop abruptly").build());
                rx2.setMedications(meds2);
                prescriptionRepository.save(rx2);

                Prescription rx3 = Prescription.builder()
                                .id("RX003").patient(p2).doctor(doctor1)
                                .doctorName("Dr. Sarah Mitchell").doctorSpecialty("Cardiology")
                                .doctorLicense("MD-2024-001").doctorHospital("MediVault General Hospital")
                                .doctorPhone("+1 (555) 987-6543")
                                .visitReason("Asthma management review")
                                .symptoms("Wheezing at night, reduced peak flow readings.")
                                .diagnosis("Moderate persistent asthma")
                                .notes("Avoid known triggers. Keep rescue inhaler accessible at all times.")
                                .followUp("2026-04-10")
                                .labTests(List.of("Spirometry", "Peak Flow Monitoring"))
                                .status(Prescription.Status.ACTIVE)
                                .build();

                List<Medication> meds3 = List.of(
                                Medication.builder().prescription(rx3).name("Budesonide Inhaler").dose("200mcg")
                                                .frequency("Twice daily").duration("60 days")
                                                .instructions("Rinse mouth after use").build(),
                                Medication.builder().prescription(rx3).name("Salbutamol Inhaler").dose("100mcg")
                                                .frequency("As needed (rescue)").duration("60 days")
                                                .instructions("Use only during attacks").build());
                rx3.setMedications(meds3);
                prescriptionRepository.save(rx3);

                // ── Documents ──────────────────────────────────────────────────────────
                documentRepository.save(Document.builder().id("DOC001").patient(p1)
                                .name("Blood Test Report - Jan 2026").type("Lab Report")
                                .date(LocalDate.of(2026, 1, 22)).uploadedBy("Dr. Sarah Mitchell").size("1.2 MB")
                                .build());
                documentRepository.save(Document.builder().id("DOC002").patient(p1)
                                .name("ECG Report - Jan 2026").type("Cardiology")
                                .date(LocalDate.of(2026, 1, 20)).uploadedBy("Dr. Sarah Mitchell").size("0.8 MB")
                                .build());
                documentRepository.save(Document.builder().id("DOC003").patient(p1)
                                .name("Chest X-Ray - Oct 2025").type("Radiology")
                                .date(LocalDate.of(2025, 10, 5)).uploadedBy("Dr. Sarah Mitchell").size("3.4 MB")
                                .build());
                documentRepository.save(Document.builder().id("DOC004").patient(p2)
                                .name("Spirometry Report - Feb 2026").type("Pulmonology")
                                .date(LocalDate.of(2026, 2, 10)).uploadedBy("Dr. Sarah Mitchell").size("0.6 MB")
                                .build());

                System.out.println("\n✅ MediVault: Database seeded successfully!");
                System.out.println("   Demo credentials:");
                System.out.println("   Patient  → patient@medivault.com / patient123");
                System.out.println("   Doctor   → doctor@medivault.com  / doctor123");
                System.out.println("   Admin    → admin@medivault.com   / admin123\n");
        }
}
