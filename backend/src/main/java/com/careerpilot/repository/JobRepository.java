package com.careerpilot.repository;

import com.careerpilot.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    Page<Job> findByActiveTrue(Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.active = true AND (" +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(j.company) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Job> searchJobs(@Param("q") String q, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.active = true " +
           "AND (:type IS NULL OR j.type = :type) " +
           "AND (:experience IS NULL OR j.experienceLevel = :experience)")
    Page<Job> findWithFilters(@Param("type") String type,
                               @Param("experience") String experience,
                               Pageable pageable);

    boolean existsByTitleAndCompany(String title, String company);

    long countByActive(boolean active);
}
