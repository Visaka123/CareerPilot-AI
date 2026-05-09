package com.careerpilot.repository;

import com.careerpilot.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);

    @Query("SELECT r.atsScore FROM Resume r WHERE r.user.id = :userId AND r.atsScore IS NOT NULL ORDER BY r.createdAt DESC LIMIT 1")
    Optional<Integer> findLatestAtsScoreByUserId(@Param("userId") Long userId);
}
