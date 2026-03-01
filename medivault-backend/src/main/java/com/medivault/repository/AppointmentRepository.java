package com.medivault.repository;

import com.medivault.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientIdOrderByStartTimeDesc(String patientId);

    List<Appointment> findByDoctorIdOrderByStartTimeAsc(Long doctorId);

    List<Appointment> findByDoctorIdAndStartTimeBetweenOrderByStartTimeAsc(Long doctorId,
                                                                           LocalDateTime from,
                                                                           LocalDateTime to);
}

