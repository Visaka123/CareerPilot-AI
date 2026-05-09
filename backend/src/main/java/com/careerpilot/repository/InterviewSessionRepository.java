package com.careerpilot.repository;

import com.careerpilot.model.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {

    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<InterviewSession> findTop3ByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);

    @Query("SELECT COUNT(s) FROM InterviewSession s WHERE s.user.id = :userId AND s.createdAt BETWEEN :start AND :end")
    long countByUserIdAndCreatedAtBetween(@Param("userId") Long userId,
                                           @Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);
}
