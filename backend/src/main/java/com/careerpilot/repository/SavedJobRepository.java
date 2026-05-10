package com.careerpilot.repository;

import com.careerpilot.model.Job;
import com.careerpilot.model.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    List<SavedJob> findByUserId(Long userId);
    boolean existsByUserIdAndJobId(Long userId, Long jobId);

    @Query("SELECT s FROM SavedJob s JOIN FETCH s.job WHERE s.user.id = :userId")
    List<SavedJob> findByUserIdWithJob(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM SavedJob s WHERE s.user.id = :userId AND s.job.id = :jobId")
    void deleteByUserIdAndJobId(Long userId, Long jobId);
}
