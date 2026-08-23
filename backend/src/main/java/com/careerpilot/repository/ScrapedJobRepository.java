package com.careerpilot.repository;

import com.careerpilot.model.ScrapedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScrapedJobRepository extends JpaRepository<ScrapedJob, Long> {

    List<ScrapedJob> findByCollectorIdOrderByScrapedAtDesc(String collectorId);

    List<ScrapedJob> findAllByOrderByScrapedAtDesc();

    @Query("SELECT j FROM ScrapedJob j WHERE LOWER(j.jobTitle) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.company) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.location) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.techStack) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY j.scrapedAt DESC")
    List<ScrapedJob> searchJobs(@Param("query") String query);
}
