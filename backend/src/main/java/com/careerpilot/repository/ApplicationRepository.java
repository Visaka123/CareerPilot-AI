package com.careerpilot.repository;

import com.careerpilot.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByUserIdOrderByAppliedDateDesc(Long userId);

    List<Application> findTop5ByUserIdOrderByAppliedDateDesc(Long userId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.user.id = :userId AND a.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Application.Status status);

    long countByUserId(Long userId);

    long countByStatus(Application.Status status);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.user.id = :userId AND a.appliedDate BETWEEN :start AND :end")
    long countByUserIdAndAppliedDateBetween(@Param("userId") Long userId,
                                             @Param("start") LocalDateTime start,
                                             @Param("end") LocalDateTime end);

    // Auto apply related queries
    boolean existsByUserIdAndJobId(Long userId, Long jobId);

    List<Application> findByUserIdAndJobId(Long userId, Long jobId);

    @Query("SELECT a FROM Application a WHERE a.status IN ('FAILED', 'RETRYING') AND a.applicationType = 'AUTO'")
    List<Application> findFailedAutoApplications();

    @Query("SELECT COUNT(a) FROM Application a WHERE a.user.id = :userId AND a.status = :status AND a.applicationType = 'AUTO'")
    long countByUserIdAndStatusAndApplicationType(@Param("userId") Long userId,
                                                  @Param("status") Application.Status status);
}
